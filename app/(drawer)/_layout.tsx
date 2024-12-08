import { Drawer } from "expo-router/drawer";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import Text from "@/components/Text";
import React from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface CustomDrawerContentProps {
  isArtist: boolean;
}

const CustomDrawerContent = ({ isArtist }: CustomDrawerContentProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        height: "90%",
        marginTop: insets.top,
      }}
    >
      {isArtist ? (
        <View style={styles.artistProfileCard}>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/artist/MyProfile",
              });
            }}
            style={styles.userProfileRow}
          >
            <View style={styles.pictureAndName}>
              <Image
                style={styles.profilePicture}
                source={require("../../assets/images/Artist.png")}
              />
              <View>
                <Text size="profileName" weight="semibold" color="white">
                  Martin Luis
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
              412
            </Text>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.userProfileRow}>
            <View style={styles.pictureAndName}>
              <Image
                style={styles.profilePicture}
                source={require("../../assets/images/Artist.png")}
              />
              <View>
                <Text size="profileName" weight="semibold" color="white">
                  Martin Luis
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
      <Text size="medium" weight="semibold" color="#A7A7A7">
        SETTINGS
      </Text>
      <View style={styles.drawerItemList}>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/artist/EditProfile",
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
          <TouchableOpacity style={styles.drawerItem}>
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
        <TouchableOpacity style={styles.drawerItem}>
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
        <TouchableOpacity style={styles.drawerItem}>
          <Image
            style={styles.icon}
            source={require("../../assets/images/support_agent.png")}
          />
          <Text size="h4" weight="normal" color="#FBF6FA">
            Help and Support
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem}>
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
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        {!isArtist && (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/artist/RegisterArtist",
              });
            }}
          >
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
        <TouchableOpacity style={styles.logoutButton}>
          <Image
            style={styles.icon}
            source={require("../../assets/images/logout.png")}
          />
          <Text size="h4" weight="semibold" color="#FBF6FA">
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerLayout: React.FC = () => {
  const isArtist = false;
  const router = useRouter();

  const closeDrawer = () => {
    router.back();
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent isArtist={isArtist} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: "100%",
          paddingHorizontal: 16,
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
    resizeMode: "contain",
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
    backgroundColor: "#FFFFFF26",
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
