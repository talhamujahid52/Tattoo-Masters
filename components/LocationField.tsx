import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Text from "@/components/Text";
import { LocationData } from "@/types/user";
import { normalize } from "@/utils/helperFunctions";
import {
  getPlace,
  PlaceSuggestion,
  searchPlaces,
} from "@/utils/googlePlaces";
import { lookUpPlace, toLocationData } from "@/utils/locationHelpers";

const SUGGEST_DELAY_MS = 300;
// How long a pause in typing counts as having finished
const ESTIMATE_DELAY_MS = 1000;
const MIN_SEARCH_LENGTH = 3;

// Where the text in the field points to. `address` is only set when a
// suggestion was picked; typed text is left exactly as it was typed.
export type ResolvedLocation = {
  location: LocationData;
  city?: string;
  address?: string;
};

interface LocationFieldProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onResolve: (place: ResolvedLocation) => void;
  onClear: () => void;
}

// Closest position for free text: the device's geocoder first, then the best
// address suggestion. Null leaves the pin where it is.
const estimatePlace = async (
  text: string,
  bestSuggestion?: PlaceSuggestion
): Promise<ResolvedLocation | null> => {
  try {
    const [hit] = await Location.geocodeAsync(text);
    const location = toLocationData(hit);
    if (location) {
      const place = await lookUpPlace(location).catch(() => null);
      return { location, city: place?.city };
    }
  } catch {
    // No geocoder, or no permission to use it: fall through
  }

  if (!bestSuggestion) return null;
  const place = await getPlace(bestSuggestion.place_id).catch(() => null);
  return place && { location: place.location, city: place.city };
};

/**
 * Address field of the artist forms. It is typed into like any other field
 * and grows with its text, lists matching addresses underneath, and keeps the
 * pin in step: picking a suggestion or finishing typing reports where the text
 * points to through `onResolve`.
 *
 * The scroll view around it must use keyboardShouldPersistTaps="handled", or
 * tapping a suggestion only closes the keyboard.
 */
const LocationField = ({
  value,
  placeholder,
  onChangeText,
  onResolve,
  onClear,
}: LocationFieldProps) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  // Suggestions together with the text they were found for
  const found = useRef<{ text: string; items: PlaceSuggestion[] }>();
  // Goes up with every edit, pick and clear; a lookup only applies its result
  // if nothing happened in the meantime
  const version = useRef(0);
  // Typed text the pin has not caught up with yet
  const pendingText = useRef<string | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>();
  const estimateTimer = useRef<ReturnType<typeof setTimeout>>();

  const cancelLookups = () => {
    version.current += 1;
    clearTimeout(suggestTimer.current);
    clearTimeout(estimateTimer.current);
    return version.current;
  };

  useEffect(() => () => void cancelLookups(), []);

  const estimate = async (text: string, id: number) => {
    pendingText.current = null;

    const best =
      found.current?.text === text ? found.current.items[0] : undefined;
    const place = await estimatePlace(text, best);
    if (place && id === version.current) onResolve(place);
  };

  const handleChangeText = (text: string) => {
    // Emptying the field by hand is the same as clearing it
    if (text === "") return clear();

    const id = cancelLookups();
    pendingText.current = text;
    onChangeText(text);

    if (text.trim().length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      return;
    }

    suggestTimer.current = setTimeout(async () => {
      const items = await searchPlaces(text).catch(() => []);
      if (id !== version.current) return;
      found.current = { text, items };
      setSuggestions(items);
    }, SUGGEST_DELAY_MS);
    estimateTimer.current = setTimeout(
      () => estimate(text, id),
      ESTIMATE_DELAY_MS
    );
  };

  // Leaving the field finishes the typing, if a pause has not already
  const handleBlur = () => {
    setFocused(false);
    if (pendingText.current === null) return;

    clearTimeout(estimateTimer.current);
    estimate(pendingText.current, version.current);
  };

  const pick = async (suggestion: PlaceSuggestion) => {
    const id = cancelLookups();
    pendingText.current = null;
    setSuggestions([]);
    onChangeText(suggestion.description);
    inputRef.current?.blur();

    const place = await getPlace(suggestion.place_id).catch(() => null);
    if (id !== version.current) return;

    if (place) {
      onResolve({ ...place, address: place.address || suggestion.description });
    } else {
      estimate(suggestion.description, id);
    }
  };

  const clear = () => {
    cancelLookups();
    pendingText.current = null;
    setSuggestions([]);
    onClear();
  };

  return (
    <View>
      <View style={styles.field}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#A29F93"
          selectionColor="#A29F93"
          autoCorrect={false}
          multiline
          scrollEnabled={false}
          // Return finishes the address instead of starting a new line
          submitBehavior="blurAndSubmit"
          returnKeyType="done"
        />
        {!!value && (
          <TouchableOpacity onPress={clear}>
            <MaterialIcons
              name="cancel"
              size={24}
              color="#B1AFA1"
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      {focused && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={suggestion.place_id}
              style={[styles.suggestion, index > 0 && styles.separator]}
              onPress={() => pick(suggestion)}
            >
              <Text size="large" weight="normal" color="#FBF6FA">
                {suggestion.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Same look as Input, but free to grow past one line
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF1A",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: normalize(16),
    color: "white",
    paddingTop: 6,
    paddingBottom: 6,
    marginLeft: 4,
    textAlignVertical: "center",
  },
  icon: {
    marginHorizontal: 4,
  },
  suggestions: {
    marginTop: 4,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#242424",
  },
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#FFFFFF26",
  },
});

export default LocationField;
