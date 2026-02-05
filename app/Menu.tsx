import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import Text from "@/components/Text";
import React, { useMemo } from "react";
import { useRouter } from "expo-router";
import { clearFcmTokenOnLogout } from "@/hooks/useNotification";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { UserFirestore } from "@/types/user";
import { resetUser } from "@/redux/slices/userSlice";
import { clearSearches } from "@/redux/slices/recentSearchesSlice";

const Menu = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore
  );

  const profileImage = useMemo(() => {
    return {
      uri:
        loggedInUserFirestore?.profilePictureSmall ??
        loggedInUserFirestore?.profilePicture ??
        loggedInUser?.photoURL ??
        undefined,
    };
  }, [loggedInUser, loggedInUserFirestore]);

  const isArtist = loggedInUserFirestore?.isArtist;
  const name = loggedInUserFirestore?.name ?? loggedInUser?.displayName;

  let formattedTrialEndDate = "";
  const artistDateRaw = loggedInUserFirestore?.artistRegistrationDate;

  if (artistDateRaw) {
    const registrationDate = new Date(artistDateRaw);
    registrationDate.setFullYear(registrationDate.getFullYear() + 1);
    formattedTrialEndDate = registrationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const handleLogout = async () => {
    try {
      const uid = auth().currentUser?.uid;
      if (uid) {
        await clearFcmTokenOnLogout(uid);
      }
    } catch (e) {
      // continue regardless
    }
    await auth().signOut();
    dispatch(resetUser());
    dispatch(clearSearches());
    router.back();
  };

  const navigateTo = (pathname: string, params?: any) => {
    router.push({ pathname: pathname as any, params });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          {Platform.OS === "android" && (
            <Image
              source={require("../assets/images/android_back_arrow.png")}
              style={{ height: 15, width: 16, resizeMode: "contain" }}
            />
          )}
          {Platform.OS === "ios" && (
            <Image
              style={{ height: 24, width: 24, resizeMode: "contain" }}
              source={require("../assets/images/iosBackIcon.png")}
            />
          )}
        </TouchableOpacity>
        <Text weight="semibold" style={{ fontSize: 20 }} color="white">
          Menu
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        style={styles.scrollView}
      >
        {isArtist ? (
          <>
            <View style={styles.artistProfileCard}>
              <TouchableOpacity
                onPress={() =>
                  navigateTo("/artist/MyProfile", { loggedInUser })
                }
                style={styles.userProfileRow}
              >
                <View style={styles.pictureAndName}>
                  <Image
                    style={styles.profilePicture}
                    source={
                      profileImage?.uri
                        ? profileImage
                        : require("../assets/images/placeholder.png")
                    }
                  />
                  <View>
                    <Text size="profileName" weight="semibold" color="white">
                      {name}
                    </Text>
                    <Text size="p" weight="normal" color="#A7A7A7">
                      My artist profile
                    </Text>
                  </View>
                </View>
                <Image
                  style={styles.icon}
                  source={require("../assets/images/rightArrow.png")}
                />
              </TouchableOpacity>
              <View
                style={[styles.separator, { backgroundColor: "#473E2B" }]}
              />
              <View style={styles.artistFavoriteRow}>
                <Image
                  style={{ height: 14.5, width: 16, resizeMode: "contain" }}
                  source={require("../assets/images/favorite.png")}
                />
                <Text size="p" weight="normal" color="#A7A7A7">
                  {loggedInUserFirestore?.followersCount || 0}
                </Text>
              </View>
            </View>
            <Text
              size="large"
              weight="normal"
              color="#B1AFA4"
              style={{ textAlign: "center", marginTop: 8, marginBottom: 16 }}
            >
              Your trial ends on {formattedTrialEndDate}
            </Text>
          </>
        ) : (
          <View>
            <View style={styles.userProfileRow}>
              <View style={styles.pictureAndName}>
                <Image
                  style={styles.profilePicture}
                  source={
                    profileImage?.uri
                      ? profileImage
                      : require("../assets/images/placeholder.png")
                  }
                />
                <View>
                  <Text size="profileName" weight="semibold" color="white">
                    {name}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.separator} />
          </View>
        )}

        <View>
          <Text size="medium" weight="semibold" color="#A7A7A7">
            SETTINGS
          </Text>
          <View style={styles.drawerItemList}>
            <TouchableOpacity
              onPress={() =>
                navigateTo(
                  isArtist ? "/artist/EditProfile" : "/artist/EditProfileUser"
                )
              }
              style={styles.drawerItem}
            >
              <Image
                style={styles.icon}
                source={require("../assets/images/person_edit.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Edit profile
              </Text>
            </TouchableOpacity>

            {isArtist && (
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => navigateTo("/artist/AddTattoo")}
              >
                <Image
                  style={styles.icon}
                  source={require("../assets/images/add_photo_alternate.png")}
                />
                <Text size="h4" weight="normal" color="#FBF6FA">
                  Add tattoo
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => navigateTo("/(auth)/ChangePassword")}
              style={styles.drawerItem}
            >
              <Image
                style={styles.icon}
                source={require("../assets/images/lock.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Change password
              </Text>
            </TouchableOpacity>

            {isArtist && (
              <TouchableOpacity
                onPress={() => navigateTo("/(auth)/ReviewPassword")}
                style={styles.drawerItem}
              >
                <Image
                  style={styles.icon}
                  source={require("../assets/images/lock_person.png")}
                />
                <Text size="h4" weight="normal" color="#FBF6FA">
                  Change review password
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => navigateTo("/artist/Notification")}
            >
              <Image
                style={styles.icon}
                source={require("../assets/images/notifications.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Notifications
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          <View>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => navigateTo("/artist/HelpAndSupport")}
            >
              <Image
                style={styles.icon}
                source={require("../assets/images/support_agent.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Help and support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => navigateTo("/artist/Feedback")}
            >
              <Image
                style={styles.icon}
                source={require("../assets/images/feedback.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Feedback
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          <TouchableOpacity
            onPress={() => navigateTo("/(auth)/DeleteAccount")}
          >
            <Text
              size="medium"
              weight="semibold"
              color="#A7A7A7"
              style={{ textDecorationLine: "underline" }}
            >
              Delete account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerArtistContainer}>
          {!isArtist && (
            <TouchableOpacity
              style={{ height: 132 }}
              onPress={() => navigateTo("/artist/RegisterArtist")}
            >
              <View style={{ position: "relative" }}>
                <Image
                  style={styles.registerArtist}
                  source={require("../assets/images/registerArtistBackground.png")}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    right: 16,
                  }}
                >
                  <Text weight="semibold" color="#FBF6FA">
                    Register as an artist
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginTop: 8,
                    }}
                  >
                    <Text weight="semibold" color="#A7A7A7" style={{ flex: 1 }}>
                      Get registered as an artist and become{"\n"}a Tattoo
                      Master for customers to find.
                    </Text>
                    <Image
                      style={styles.icon}
                      source={require("../assets/images/rightArrow.png")}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => navigateTo("/(auth)/TermsOfService")}
            >
              <Text size="small" weight="normal" color="#FBF6FA">
                Terms of Service
              </Text>
            </TouchableOpacity>
            <Text size="small" weight="normal" color="#828282">
              {" "}
              and{" "}
            </Text>
            <TouchableOpacity
              onPress={() => navigateTo("/(auth)/PrivacyPolicy")}
            >
              <Text size="small" weight="normal" color="#FBF6FA">
                Privacy Policy.
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Image
              style={styles.icon}
              source={require("../assets/images/logout.png")}
            />
            <Text size="h4" weight="semibold" color="#FBF6FA">
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    height: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomColor: "#282828",
    borderBottomWidth: 0.33,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    justifyContent: "space-between",
    flexGrow: 1,
  },
  artistProfileCard: {
    backgroundColor: "#2E2206",
    padding: 16,
    borderRadius: 12,
  },
  artistFavoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userProfileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pictureAndName: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    height: 52,
    width: 52,
    resizeMode: "cover",
    borderRadius: 50,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#202020",
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#2D2D2D",
    marginVertical: 16,
  },
  drawerItemList: {
    paddingTop: 16,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  registerArtistContainer: {},
  registerArtist: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  termsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 24,
  },
  logoutButton: {
    height: 52,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#303030",
    gap: 10,
  },
});
