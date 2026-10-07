import React, { useCallback, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { View, StyleSheet } from "react-native";

const useFilterBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const show = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const hide = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        hide();
      }
    },
    [hide]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.7}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const renderHandle = useCallback(
    () => (
      <View style={styles.handleWrapper}>
        <View style={styles.handleInner}>
          <View style={styles.handleIndicator} />
        </View>
      </View>
    ),
    []
  );

  const BottomSheet = useCallback(
    ({ InsideComponent }: { InsideComponent: React.ReactNode }) => (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={["80%"]}
        enableDynamicSizing={false}
        enableOverDrag={false}
        // Only activate the content pan on vertical movement and fail it on
        // horizontal movement, so the native radius Slider (a plain Android
        // SeekBar with no gesture-handler wrapper) keeps its drag instead of
        // being cancelled by the sheet's pan.
        activeOffsetY={[-10, 10]}
        failOffsetX={[-10, 10]}
        backdropComponent={renderBackdrop}
        onDismiss={hide}
        onChange={handleSheetChanges}
        handleComponent={renderHandle}
        backgroundStyle={styles.sheetBackground}
      >
        {/* Plain RN View on purpose. FilterBottomSheet owns the single
            scrollable (its BottomSheetScrollView) so its title row and Apply
            footer stay pinned. Do not use BottomSheetView here: its mount
            effect runs after the child's and re-registers the sheet content
            as a non-scrollable VIEW, which makes the sheet pan swallow every
            vertical drag and the inner list stops scrolling. */}
        <View style={{ backgroundColor: "#080808", flex: 1 }}>
          {InsideComponent}
        </View>
      </BottomSheetModal>
    ),
    [hide, handleSheetChanges, renderBackdrop]
  );

  return { BottomSheet, show, hide };
};

const BORDER_RADIUS = 16;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#080808",
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  handleWrapper: {
    paddingTop: 2,
    backgroundColor: "#2D2D2D",
    borderTopLeftRadius: BORDER_RADIUS + 2,
    borderTopRightRadius: BORDER_RADIUS + 2,
  },
  handleInner: {
    backgroundColor: "#080808",
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    alignItems: "center",
    padding: 10,
  },
  handleIndicator: {
    width: 60,
    height: 6,
    backgroundColor: "#838383",
    borderRadius: 13,
  },
});

export default useFilterBottomSheet;
