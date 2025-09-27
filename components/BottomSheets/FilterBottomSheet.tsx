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
import { BottomSheetScrollView, useBottomSheet } from "@gorhom/bottom-sheet";
import useTattooStyles from "@/hooks/useTattooStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FilterBottomSheet = ({
  searchActiveFor,
}: {
  searchActiveFor: "tattoos" | "artists";
}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  // Enable style filters for both tattoos and artists
  const stylesEnabled =
    searchActiveFor === "tattoos" || searchActiveFor === "artists";

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

  // Centralized fetch of style titles
  const { titles: fetchedStyleTitles } = useTattooStyles();

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

  // When fetched titles or persisted selections change, sync local styles list
  useEffect(() => {
    if (fetchedStyleTitles.length > 0) {
      const selectedSet = new Set(
        (persistedStyles || []).filter((s) => s.selected).map((s) => s.title),
      );
      const merged = fetchedStyleTitles.map((title, idx) => ({
        title,
        value: idx + 1,
        selected: selectedSet.has(title),
      }));
      setStylesLocal(merged);
    }
  }, [fetchedStyleTitles, persistedStyles]);

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
    bottomSheet.close(); // close the bottom sheet after clearing
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
        <BottomSheetScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 72 + insets.bottom }}
          showsVerticalScrollIndicator={true}
        >
          {/* radius toggle */}
          <View style={styles.toggleButtonRow}>
            <Text size="h4" weight="semibold" color="#A7A7A7">
              Within your radius
            </Text>
            <Switch
              style={{ width: 75 }}
              // trackColor={{ false: "#767577", true: "#44e52c" }}
              // thumbColor={radiusEnabled ? "#fff" : "#f4f3f4"}
              // ios_backgroundColor="#3e3e3e"
              onValueChange={toggleRadius}
              value={radiusEnabled}
            />
          </View>

          {/* radius slider */}
          {radiusEnabled && (
            <View style={styles.sliderRow}>
              <Slider
                style={{
                  width: "80%",
                  height: 40,
                }}
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
          )}

          {/* rating */}
          <Text size="h4" weight="semibold" color="#A7A7A7">
            Rating
          </Text>
          <View style={styles.ratingButtonsRow}>
            {ratings.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => selectRating(r.value)}
                activeOpacity={1}
                style={[
                  styles.chip,
                  {
                    backgroundColor: r.selected ? "#DAB769" : "#262526",
                  },
                ]}
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
                  onPress={() => toggleStudio(s.value)}
                  activeOpacity={1}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: s.selected ? "#DAB769" : "#262526",
                    },
                  ]}
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
                    {
                      backgroundColor: s.selected ? "#DAB769" : "#262526",
                    },
                  ]}
                  // block presses when disabled
                  disabled={!stylesEnabled}
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
        </BottomSheetScrollView>

        {/* dark backdrop under the footer to hide content */}
        <View
          pointerEvents="none"
          style={[styles.footerBackdrop, { height: 72 + insets.bottom }]}
        />

        {/* sticky apply */}
        <View style={[styles.footerPinned, { bottom: 16 + insets.bottom }]}>
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
  container: { backgroundColor: "#080808", flex: 1 },
  titleRow: {
    height: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF26",
    paddingHorizontal: 16,
  },
  contentContainer: { paddingHorizontal: 16, position: "relative", flex: 1 },
  scrollArea: { flex: 1 },
  toggleButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  footerPinned: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 10,
    backgroundColor: "#080808",
    paddingTop: 8,
    elevation: 6,
  },
  footerBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#080808",
    zIndex: 5,
  },
});
