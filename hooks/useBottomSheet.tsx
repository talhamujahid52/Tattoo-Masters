import React, { useCallback, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

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

  // Custom backdrop that darkens the screen and closes on press
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

  const BottomSheet = useCallback(
    ({ InsideComponent }: { InsideComponent: React.ReactNode }) => (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        backdropComponent={renderBackdrop} // ← add this
        onDismiss={hide}
        onChange={handleSheetChanges}
        handleStyle={{
          backgroundColor: "#000000",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}
        handleIndicatorStyle={{ backgroundColor: "#838383" }}
      >
        <BottomSheetView>{InsideComponent}</BottomSheetView>
      </BottomSheetModal>
    ),
    [hide, handleSheetChanges, renderBackdrop],
  );

  return { BottomSheet, show, hide };
};

export default useBottomSheet;
