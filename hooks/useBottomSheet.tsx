import React, { useCallback, useRef } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";

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

  const BottomSheet = useCallback(
    ({ InsideComponent }: { InsideComponent: React.ReactNode }) => (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        // snapPoints={["80%"]}
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
    [hide, handleSheetChanges]
  );

  return { BottomSheet, show, hide };
};

export default useBottomSheet;
