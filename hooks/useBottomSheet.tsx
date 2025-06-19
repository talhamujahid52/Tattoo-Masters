import React, { useCallback, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ScrollView, View, StyleSheet } from "react-native";

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
        backdropComponent={renderBackdrop}
        onDismiss={hide}
        onChange={handleSheetChanges}
        handleComponent={renderHandle}
      >
        <BottomSheetView style={{ backgroundColor: "#080808" }}>
          <ScrollView>{InsideComponent}</ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    ),
    [hide, handleSheetChanges, renderBackdrop]
  );

  return { BottomSheet, show, hide };
};

const styles = StyleSheet.create({
  handleWrapper: {
    paddingTop: 2,
    backgroundColor: "#2D2D2D", // border color
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  handleInner: {
    backgroundColor: "#080808",
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    alignItems: "center",
    padding: 10,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#838383",
    borderRadius: 2,
  },
});

export default useBottomSheet;
