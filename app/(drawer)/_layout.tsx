import { Drawer } from "expo-router/drawer";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Text from "@/components/Text";
import React, { useMemo } from "react";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { UserFirestore } from "@/types/user";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const CustomDrawerContent = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const loggedInUser: FirebaseAuthTypes.User = useSelector(
    (state: any) => state?.user?.user,
  );
  const loggedInUserFirestore: UserFirestore = useSelector(
    (state: any) => state?.user?.userFirestore,
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

  const isArtist = loggedInUserFirestore?.isArtist; //Get From LoggedIn User
  const name = loggedInUserFirestore?.name ?? loggedInUser?.displayName;

  return (
    <>
      <View
        style={{
          height: insets.top + 30,
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingHorizontal: 16,
          borderBottomColor: "#282828",
          borderBottomWidth: 0.33,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            style={{ height: 30, width: 30 }}
          >
            <Image
              style={{ height: 13, width: 20 }}
              source={require("../../assets/images/back-arrow.png")}
            />
          </TouchableOpacity>
          <Text weight="medium" size="h4" color="white">
            Menu
          </Text>
          <View style={{ width: 40 }}></View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          minHeight: SCREEN_HEIGHT - insets.top - 20,
          paddingBottom: insets.bottom + 20,
          justifyContent: "space-between",
          // backgroundColor:"green"
        }}
        style={{
          flex: 1,
          paddingHorizontal: 16,
          // marginTop: insets.top + 20,
        }}
      >
        {isArtist ? (
          <View style={styles.artistProfileCard}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/artist/MyProfile",
                  params: { loggedInUser: loggedInUser },
                });
              }}
              style={styles.userProfileRow}
            >
              <View style={styles.pictureAndName}>
                <Image style={styles.profilePicture} source={profileImage} />
                <View>
                  <Text size="profileName" weight="semibold" color="white">
                    {name}
                  </Text>
                  <Text size="p" weight="normal" color="#A7A7A7">
                    My Artist Profile
                  </Text>
                </View>
              </View>
              <Image
                style={styles.icon}
                source={require("../../assets/images/rightArrow.png")}
              />
            </TouchableOpacity>
            <View style={styles.seprator}></View>
            <View style={styles.artistFavoriteRow}>
              <Image
                style={styles.icon}
                source={require("../../assets/images/favorite.png")}
              />
              <Text size="p" weight="normal" color="#A7A7A7">
                {loggedInUserFirestore?.followersCount
                  ? loggedInUserFirestore?.followersCount
                  : "412"}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.userProfileRow}>
              <View style={styles.pictureAndName}>
                <Image style={styles.profilePicture} source={profileImage} />
                <View>
                  <Text size="profileName" weight="semibold" color="white">
                    {name}
                  </Text>
                  <Text size="p" weight="normal" color="#A7A7A7">
                    My Profile
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.seprator}></View>
          </View>
        )}
        <View>
          <Text size="medium" weight="semibold" color="#A7A7A7">
            SETTINGS
          </Text>
          <View style={styles.drawerItemList}>
            <TouchableOpacity
              onPress={() => {
                isArtist
                  ? router.push({
                      pathname: "/artist/EditProfile",
                    })
                  : router.push({
                      pathname: "/artist/EditProfileUser",
                    });
              }}
              style={styles.drawerItem}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/person_edit.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Edit Profile
              </Text>
            </TouchableOpacity>
            {isArtist && (
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  router.push({
                    pathname: "/artist/AddTattoo",
                  });
                }}
              >
                <Image
                  style={styles.icon}
                  source={require("../../assets/images/add_photo_alternate.png")}
                />
                <Text size="h4" weight="normal" color="#FBF6FA">
                  Add tattoo
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(auth)/ChangePassword",
                });
              }}
              style={styles.drawerItem}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/lock.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Change password
              </Text>
            </TouchableOpacity>
            {isArtist && (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/(auth)/ReviewPassword",
                  });
                }}
                style={styles.drawerItem}
              >
                <Image
                  style={styles.icon}
                  source={require("../../assets/images/lock_person.png")}
                />
                <Text size="h4" weight="normal" color="#FBF6FA">
                  Change review password
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                router.push({
                  pathname: "/artist/Notification",
                });
              }}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/notifications.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Notifications
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.seprator}></View>
          <View>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                router.push({
                  pathname: "/artist/HelpAndSupport",
                });
              }}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/support_agent.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Help and Support
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                router.push({
                  pathname: "/artist/Feedback",
                });
              }}
            >
              <Image
                style={styles.icon}
                source={require("../../assets/images/feedback.png")}
              />
              <Text size="h4" weight="normal" color="#FBF6FA">
                Feedback
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.seprator}></View>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/(auth)/DeleteAccount",
              });
            }}
          >
            <Text
              size="medium"
              weight="semibold"
              color="#A7A7A7"
              style={{ textDecorationLine: "underline" }}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.registerArtistContainer}>
          {!isArtist && (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/artist/RegisterArtist",
                });
              }}
            >
              {/* Register as an artist */}
              <Image
                style={styles.registerArtist}
                source={require("../../assets/images/registerartist.png")}
              />
            </TouchableOpacity>
          )}
          <View style={styles.TermsOfServiceContainer}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(auth)/TermsOfService",
                });
              }}
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
              onPress={() => {
                router.push({
                  pathname: "/(auth)/PrivacyPolicy",
                });
              }}
            >
              <Text size="small" weight="normal" color="#FBF6FA">
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              auth().signOut();
            }}
            style={styles.logoutButton}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/images/logout.png")}
            />
            <Text size="h4" weight="semibold" color="#FBF6FA">
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const DrawerLayout: React.FC = () => {
  // const loggedInUser = useSelector((state: any) => state?.user?.user);
  // const loggedInUserFirestore = useSelector(
  //   (state: any) => state?.user?.userFirestore,
  // );
  // // const isArtist = loggedInUser?.isArtist; //Get From LoggedIn User
  // console.log("loggedInUser", loggedInUserFirestore);
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: "100%",
          // paddingHorizontal: 16,
          backgroundColor: "black",
        },
      }}
    ></Drawer>
  );
};

export default DrawerLayout;

const styles = StyleSheet.create({
  artistProfileCard: {
    backgroundColor: "#2E2206",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  artistFavoriteRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userProfileRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pictureAndName: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    height: 52,
    width: 52,
    resizeMode: "cover",
    borderRadius: 50,
    marginRight: 16,
  },
  icon: {
    height: 24,
    width: 24,
    resizeMode: "contain",
  },
  seprator: {
    height: 1,
    width: "100%",
    backgroundColor: "#2D2D2D",
    marginVertical: 16,
  },
  drawerItemList: {
    paddingTop: 16,
  },
  drawerItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  registerArtistContainer: {
    marginTop: "20%",
  },
  registerArtist: {
    height: 132,
    width: "100%",
    resizeMode: "contain",
  },
  TermsOfServiceContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 24,
  },
  logoutButton: {
    height: 52,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#303030",
    gap: 10,
  },
});
