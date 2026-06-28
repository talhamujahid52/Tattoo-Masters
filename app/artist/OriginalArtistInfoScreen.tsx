import React, { useContext, useMemo } from "react";
import { StyleSheet, View, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import Text from "../../components/Text";
import Button from "@/components/Button";
import { FormContext } from "@/context/FormContext";
import { UserFirestore } from "@/types/user";
import { useSelector } from "react-redux";

const OriginalArtistInfoScreen = () => {
  const insets = useSafeAreaInsets();
  const { originalArtistNumber } = useLocalSearchParams();
  const { formData, setFormData } = useContext(FormContext)!;
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );
  const loggedInUser = useSelector((state: any) => state?.user?.user);

  const profileImage = useMemo(() => {
    return {
      uri:
        formData?.profilePicture ??
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL ??
        undefined,
    };
  }, [loggedInUser, loggedInUserFirestore, formData]);

  const getOrdinal = (num: any) => {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;

    return `${num}th`;
  };
  return (
    <ImageBackground
      source={require("../../assets/images/originalArtistBackground.png")}
      resizeMode="cover"
      style={styles.container}
    >
      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.artistContainer}>
          <ExpoImage
            source={profileImage}
            contentFit="cover"
            style={styles.artistImage}
          />

          {/* Original Artist Badge */}
          <View style={styles.artistBadge}>
            <ExpoImage
              source={require("../../assets/images/originalArtist.png")}
              contentFit="cover"
              style={styles.badgeImage}
            />
          </View>
        </View>

        <Text
          size="profileName"
          weight="medium"
          color="#FBF6FA"
          style={styles.title}
        >
          Congratulations!
        </Text>

        <Text
          size="p"
          weight="normal"
          color="#B1AFA4"
          style={styles.description}
        >
          You are the {getOrdinal(originalArtistNumber)} tattoo artist on Tattoo
          Masters! As an appreciation we want to reward you with this golden{" "}
          <Text size="p" weight="normal" color="#DAB769">
            Original Artist badge{" "}
          </Text>
          as one of our first 250 Original Artists.
        </Text>
        <Text
          size="p"
          weight="normal"
          color="#B1AFA4"
          style={styles.description}
        >
          We welcome you aboard and hope you enjoy your exclusive membership
          with higher search rankings and additional benefits.
        </Text>
      </View>

      {/* Bottom Button */}
      <View
        style={[
          styles.buttonContainer,
          {
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Button
          title="Continue"
          onPress={() => {
            router.push("/artist/SubscriptionInfo");
          }}
        />
      </View>
    </ImageBackground>
  );
};

export default OriginalArtistInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  artistContainer: {
    width: 131,
    height: 170,
    position: "relative",
    overflow: "visible",
  },

  artistImage: {
    width: 131,
    height: 170,
    borderRadius: 12,
  },

  artistBadge: {
    position: "absolute",
    right: -10,
    bottom: -4,
  },

  badgeImage: {
    width: 44,
    height: 44,
  },

  title: {
    marginTop: 24,
    textAlign: "center",
  },

  description: {
    marginTop: 12,
    textAlign: "center",
  },

  buttonContainer: {
    width: "100%",
  },
});
