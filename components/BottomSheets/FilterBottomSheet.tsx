import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useSelector, useDispatch } from "react-redux";
import {
  selectFilter,
  setRadiusEnabled,
  setRadiusValue,
  setRatings as setRatingsAction,
  setStudio as setStudioAction,
  setStyles as setStylesAction,
} from "@/redux/slices/filterSlices";
import Text from "../Text";
import Button from "../Button";
import { useBottomSheet } from "@gorhom/bottom-sheet";

const FilterBottomSheet = () => {
  const dispatch = useDispatch();

  const bottomSheet = useBottomSheet();
  /** ──────────────────────────
   *  1. Pull current persisted filters
   *  ────────────────────────── */
  const {
    isEnabledRadius: persistedRadiusEnabled,
    radiusValue: persistedRadiusValue,
    ratings: persistedRatings,
    studio: persistedStudio,
    styles: persistedStyles,
  } = useSelector(selectFilter);

  /** ──────────────────────────
   *  2. Local “draft” state
   *  ────────────────────────── */
  const [radiusEnabled, setRadiusEnabledLocal] = useState(
    persistedRadiusEnabled,
  );
  const [radiusValue, setRadiusValueLocal] = useState(persistedRadiusValue);
  const [ratings, setRatingsLocal] = useState(persistedRatings);
  const [studio, setStudioLocal] = useState(persistedStudio);
  const [tattooStyles, setStylesLocal] = useState(persistedStyles);

  /** ──────────────────────────
   *  3. Sync local state when sheet is reopened
   *     (important if the user applied filters earlier,
   *      closed the sheet, then opens it again)
   *  ────────────────────────── */
  useEffect(() => {
    setRadiusEnabledLocal(persistedRadiusEnabled);
    setRadiusValueLocal(persistedRadiusValue);
    setRatingsLocal(persistedRatings);
    setStudioLocal(persistedStudio);
    setStylesLocal(persistedStyles);
  }, [
    persistedRadiusEnabled,
    persistedRadiusValue,
    persistedRatings,
    persistedStudio,
    persistedStyles,
  ]);

  /** ──────────────────────────
   *  4. Handlers that only touch local state
   *  ────────────────────────── */
  const toggleRadius = async () => {
    if (!radiusEnabled) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permissions are disabled. Please enable them in the Settings app.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    setRadiusEnabledLocal(!radiusEnabled);
  };

  const selectRating = (value: number) =>
    setRatingsLocal((curr) =>
      curr.map((r) => ({ ...r, selected: r.value === value })),
    );

  const toggleStudio = (value: number) =>
    setStudioLocal((curr) =>
      curr.map((s) =>
        s.value === value ? { ...s, selected: !s.selected } : s,
      ),
    );

  const toggleStyle = (value: number) =>
    setStylesLocal((curr) =>
      curr.map((s) =>
        s.value === value ? { ...s, selected: !s.selected } : s,
      ),
    );

  /** ──────────────────────────
   *  5. Commit staged values
   *  ────────────────────────── */
  const handleApply = useCallback(() => {
    dispatch(setRadiusEnabled(radiusEnabled));
    dispatch(setRadiusValue(radiusValue));
    dispatch(setRatingsAction(ratings));
    dispatch(setStudioAction(studio));
    dispatch(setStylesAction(tattooStyles));
    bottomSheet.close(); // close the bottom sheet after applying filters
    // close sheet here if you’re controlling it from parent
  }, [dispatch, radiusEnabled, radiusValue, ratings, studio, tattooStyles]);

  /** ──────────────────────────
   *  6. Clear all (local + redux so list clears right away)
   *  ────────────────────────── */
  const handleClearAll = () => {
    const resetRatings = ratings.map((r) => ({ ...r, selected: false }));
    const resetStudio = studio.map((s) => ({ ...s, selected: false }));
    const resetStyles = tattooStyles.map((s) => ({ ...s, selected: false }));

    // reset local
    setRadiusEnabledLocal(false);
    setRadiusValueLocal(50);
    setRatingsLocal(resetRatings);
    setStudioLocal(resetStudio);
    setStylesLocal(resetStyles);

    // reset persisted
    dispatch(setRadiusEnabled(false));
    dispatch(setRadiusValue(50));
    dispatch(setRatingsAction(resetRatings));
    dispatch(setStudioAction(resetStudio));
    dispatch(setStylesAction(resetStyles));
  };

  /** ──────────────────────────
   *  7. Render
   *  ────────────────────────── */
  return (
    <View style={styles.container}>
      {/* title row */}
      <View style={styles.titleRow}>
        <View style={{ width: 70, height: 2 }} />
        <Text size="h4" weight="medium" color="#FFF">
          Filters
        </Text>
        <TouchableOpacity style={{ width: 70 }} onPress={handleClearAll}>
          <Text size="h4" weight="normal" color="#DAB769">
            Clear all
          </Text>
        </TouchableOpacity>
      </View>

      {/* content */}
      <View style={styles.contentContainer}>
        {/* radius toggle */}
        <View style={styles.toggleButtonRow}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Within your radius
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#44e52c" }}
            thumbColor={radiusEnabled ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleRadius}
            value={radiusEnabled}
          />
        </View>

        {/* radius slider */}
        <View style={styles.sliderRow}>
          <Slider
            style={{ width: "80%", height: 40 }}
            value={radiusValue}
            onValueChange={setRadiusValueLocal}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#F2D189"
            maximumTrackTintColor="#FFFFFF26"
            thumbTintColor="#F2D189"
            disabled={!radiusEnabled}
          />
          <Text size="p" weight="normal" color="#A7A7A7">
            {radiusValue.toFixed()} Km
          </Text>
        </View>

        {/* rating */}
        <Text size="h4" weight="semibold" color="#A7A7A7">
          Rating
        </Text>
        <View style={styles.ratingButtonsRow}>
          {ratings.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.chip,
                { backgroundColor: r.selected ? "#DAB769" : "#262526" },
              ]}
              onPress={() => selectRating(r.value)}
              activeOpacity={1}
            >
              <Text
                size="p"
                weight="normal"
                color={r.selected ? "#22221F" : "#A7A7A7"}
              >
                {r.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* studio */}
        <View style={styles.studioRow}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Studio
          </Text>
          <View style={styles.ratingButtonsRow}>
            {studio.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.chip,
                  { backgroundColor: s.selected ? "#DAB769" : "#262526" },
                ]}
                onPress={() => toggleStudio(s.value)}
                activeOpacity={1}
              >
                <Text
                  size="p"
                  weight="normal"
                  color={s.selected ? "#22221F" : "#A7A7A7"}
                >
                  {s.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* styles */}
        <View style={styles.tattooStylesRow}>
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Styles
          </Text>
          <View style={styles.ratingButtonsRow}>
            {tattooStyles.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.chip,
                  { backgroundColor: s.selected ? "#DAB769" : "#262526" },
                ]}
                onPress={() => toggleStyle(s.value)}
                activeOpacity={1}
              >
                <Text
                  size="p"
                  weight="normal"
                  color={s.selected ? "#22221F" : "#A7A7A7"}
                >
                  {s.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* apply */}
        <View style={{ marginVertical: 32 }}>
          <Button title="Apply" onPress={handleApply} />
        </View>
      </View>
    </View>
  );
};

export default FilterBottomSheet;

/** ──────────────────────────
 *  Styles unchanged except tiny helper
 *  ────────────────────────── */
const styles = StyleSheet.create({
  container: { backgroundColor: "#000" },
  titleRow: {
    height: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF26",
    paddingHorizontal: 16,
  },
  contentContainer: { paddingHorizontal: 16 },
  toggleButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 32,
  },
  ratingButtonsRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: { padding: 6, borderRadius: 6 },
  studioRow: { marginVertical: 32 },
  tattooStylesRow: {
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF26",
  },
});
