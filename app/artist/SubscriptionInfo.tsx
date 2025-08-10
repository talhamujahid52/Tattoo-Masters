import Button from "@/components/Button";
import React from "react";
import { Dimensions, StyleSheet, View, Image } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/Text";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const SubscriptionInfo = () => {
  const insets = useSafeAreaInsets();
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );

  let formattedTrialEndDate = "";
  if (loggedInUserFirestore?.createdAt?.seconds) {
    const milliseconds =
      loggedInUserFirestore.createdAt.seconds * 1000 +
      loggedInUserFirestore.createdAt.nanoseconds / 1e6;

    const trialStartDate = new Date(milliseconds);
    trialStartDate.setFullYear(trialStartDate.getFullYear() + 1); // Add 1 year

    formattedTrialEndDate = trialStartDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#23221F",
      }}
    >
      <Image
        source={require("../../assets/images/shareProfileBackground.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "black",
          opacity: 0.75,
          zIndex: 1, // higher than background image, lower than content
        }}
      />

      <LinearGradient
        style={styles.gradientOverlay}
        locations={[0, 0.17, 0.89]}
        colors={["rgba(25, 25, 23, 0.2)", "rgba(25, 25, 23, 0.3)", "#171715"]}
      />
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["#403622", "#080808", "#080808"]}
        locations={[0, 0.4423, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.buttonContainer,
          { bottom: 0, paddingBottom: insets.bottom },
        ]}
      >
        <Text
          size="h2"
          weight="semibold"
          color="#FFD982"
          style={{ marginBottom: 16 }}
        >
          PROFESSIONAL
        </Text>
        <Text
          size="h1"
          weight="medium"
          color="#FBF6FA"
          style={{ marginBottom: 4 }}
        >
          $19
        </Text>
        <Text
          size="p"
          weight="normal"
          color="#B1AFA4"
          style={{ marginBottom: 16 }}
        >
          /month
        </Text>

        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#403C36",
          }}
        ></View>

        <View style={{ paddingVertical: 16, gap: 8 }}>
          {[
            "Create artist profile",
            "Share your portfolio",
            "Get reviews",
            "Get followers",
            "Get tattoo customers",
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Image
                style={{ width: 24, height: 24, resizeMode: "contain" }}
                source={require("../../assets/images/checkWhite.png")}
              />
              <Text color="#B1AFA4">{item}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Start 1 year Trial"
          onPress={() => {
            router.replace({
              pathname: "/artist/ShareProfile",
            });
          }}
        />
        <Text
          size="large"
          color="#B1AFA4"
          style={{ textAlign: "center", marginTop: 8 }}
        >
          Your trial ends on {formattedTrialEndDate}
        </Text>
      </LinearGradient>
    </View>
  );
};

export default SubscriptionInfo;

const styles = StyleSheet.create({
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  logo: {
    position: "absolute",
    width: 253,
    height: 218,
    top: SCREEN_HEIGHT * 0.2,
    zIndex: 1,
  },
  buttonContainer: {
    paddingTop: 32,
    paddingHorizontal: 24,
    zIndex: 1,
    width: "100%",
    position: "absolute",
    borderRadius: 20,
  },
});
