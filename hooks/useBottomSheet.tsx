import React, { useCallback, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { View, StyleSheet } from "react-native";

// Custom hook to manage the BottomSheet visibility and content
const useBottomSheet = () => {
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
    [hide],
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
    [],
  );

  const renderHandle = useCallback(
    () => (
      <View style={styles.handleWrapper}>
        <View style={styles.handleInner}>
          <View style={styles.handleIndicator} />
        </View>
      </View>
    ),
    [],
  );

  const BottomSheet = useCallback(
    ({ InsideComponent }: { InsideComponent: React.ReactNode }) => (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={["60%"]}
        enableDynamicSizing={false}
        enableOverDrag={false}
        backdropComponent={renderBackdrop}
        onDismiss={hide}
        onChange={handleSheetChanges}
        handleComponent={renderHandle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={{ backgroundColor: "#080808", flex: 1 }}>
          {InsideComponent}
        </BottomSheetView>
      </BottomSheetModal>
    ),
    [hide, handleSheetChanges, renderBackdrop],
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
    backgroundColor: "#2D2D2D", // "border" color
    borderTopLeftRadius: BORDER_RADIUS + 2,
    borderTopRightRadius: BORDER_RADIUS + 2,
    // overflow: "hidden",
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

export default useBottomSheet;
