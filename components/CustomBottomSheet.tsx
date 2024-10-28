// CustomBottomSheet.tsx
import React, { useRef, useCallback } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  StyleSheet,
  Text,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";

interface CustomBottomSheetProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  isVisible,
  onDismiss,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss]
  );

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onChange={handleSheetChanges}
      index={0}
      snapPoints={["100%"]}
      style={{ backgroundColor: "#000" }}
      handleStyle={{ backgroundColor: "#000000d0" }}
      handleIndicatorStyle={{ backgroundColor: "#838383" }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Image
          style={styles.Logo}
          source={require("../assets/images/logo.png")}
        />
        <Text style={styles.Description}>
          To use this feature of Tattoo Masters, you need to login or register.
        </Text>
        <Image
          style={styles.usersImage}
          source={require("../assets/images/users.png")}
        />
        <Text style={styles.Description2}>
          Over 5,000 tattoo artists to search from.
        </Text>
        <TouchableOpacity>
          <Text>Login or register</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
  contentContainer: {
    // flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#000000",
  },
  Logo: {
    height: 250,
    width: 250,
    resizeMode: "contain",
    backgroundColor: "green",
  },
  Description: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20.8,
    color: "#A7A7A7",
    textAlign: "center",
    marginHorizontal: 50,
  },
  usersImage: {
    height: 48,
    width: 183,
    resizeMode: "contain",
    marginBottom: 8,
    marginTop: 24,
  },
  Description2: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 15.51,
    color: "#A7A7A7",
    textAlign: "center",
  },
});
