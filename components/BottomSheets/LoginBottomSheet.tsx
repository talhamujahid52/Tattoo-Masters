import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import Text from "../Text";
import firestore from "@react-native-firebase/firestore";

interface LoginBottomSheetProps {
  hideLoginBottomSheet: () => void;
}

const LoginBottomSheet = ({ hideLoginBottomSheet }: LoginBottomSheetProps) => {
  const [totalArtists, setTotalArtists] = useState(0);

  const fetchArtistCount = async () => {
    try {
      const snapshot = await firestore()
        .collection("Users")
        .where("isArtist", "==", true)
        .count()
        .get();

      const count = snapshot.data().count || 0;

      const roundedCount = Math.round(count / 1000) * 1000;

      setTotalArtists(roundedCount);
    } catch (error) {
      setTotalArtists(2000); // Fallback if needed
    }
  };

  useEffect(() => {
    fetchArtistCount();
  }, []);

  return (
    <View style={styles.contentContainer}>
      <Image
        style={styles.Logo}
        source={require("../../assets/images/logo.png")}
      />
      <Text size="p" weight="normal" color="#A7A7A7" style={styles.Description}>
        To use this feature of Tattoo Masters, you need to login or register.
      </Text>
      <Image
        style={styles.usersImage}
        source={require("../../assets/images/users.png")}
      />
      <Text
        size="medium"
        weight="normal"
        color="#A7A7A7"
        style={styles.Description2}
      >
        Over {totalArtists} tattoo artists to search from.
      </Text>
      <TouchableOpacity
        style={styles.LoginOrRegisterButton}
        onPress={() => {
          hideLoginBottomSheet();
          router.push({
            pathname: "/(auth)/Login",
          });
        }}
      >
        <Text size="h4" weight="medium" color="#DAB769">
          Login or register
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginBottomSheet;

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#080808",
  },
  Logo: {
    height: 165,
    width: 191,
    resizeMode: "contain",
  },
  Description: {
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
  LoginOrRegisterButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#A291AA",
    borderRadius: 30,
    marginVertical: 24,
  },
});
