import React from "react";
import { setUser, setUserFirestoreData } from "@/redux/slices/userSlice";
import { resetUploadingStates } from "@/redux/slices/uploadQueueSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { getUpdatedUser } from "@/utils/firebase/userFunctions";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { SplashScreen, Stack, useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import {
  useNotification,
  useNotificationListeners,
} from "@/hooks/useNotification";

import dynamicLinks from "@react-native-firebase/dynamic-links";
import { backgroundUploadService } from "@/utils/BackgroundUploadService";

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);
  const userId = useSelector((state: RootState) => state.user.user?.uid);

  useNotification(userId); // Handles token, saving, etc.

  useNotificationListeners({
    onReceive: (notification) => {
      console.log("Received notification in foreground:", notification);
    },
    onRespond: (response) => {
      console.log("User tapped notification:", response);
      // Optional: deep linking or navigation
    },
  });

  const router = useRouter();
  const pathname = usePathname();
  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    // console.log("App Navigator : ", user);
    dispatch(setUser(user));
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const handleDynamicLink = (link: any) => {
      console.log("URL: ", link);
      if (link?.url) {
        const url = new URL(link.url);
        const artistId = url.searchParams.get("artistId");

        console.log("Artist Id: ", artistId);

        if (artistId) {
          router.push(`/artist/ArtistProfile?artistId=${artistId}`);
        }
      }
    };

    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);

    dynamicLinks().getInitialLink().then(handleDynamicLink);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (userId) {
      getUpdatedUser(userId).then((updatedUser) => {
        // console.log("updatedUser", updatedUser);
        dispatch(setUserFirestoreData(updatedUser));
      });
    }
  }, [userId]);

  // Initialize background upload service when user is authenticated
  useEffect(() => {
    if (userId && !initializing) {
      console.log("Initializing background upload service for user:", userId);

      // Reset any stuck upload states from previous app sessions
      dispatch(resetUploadingStates());

      // Service is already started on creation, but ensure it's running
      backgroundUploadService.start();
    }
  }, [userId, initializing]);

  useEffect(() => {
    if (!initializing) {
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1000);
    }
  }, [initializing]);

  const loggedInUser = useSelector((state: any) => state?.user?.user);
  useEffect(() => {
    if (initializing) {
      return;
    }
    if (
      pathname !== "/Home" &&
      pathname !== "/Login" &&
      loggedInUser?.emailVerified === true
    ) {
      router.replace("/(bottomTabs)/Home");
    }
    if (pathname == "/Login" && loggedInUser?.emailVerified === true) {
      router.back();
    }
  }, [userId, initializing]);

  if (initializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000" },
          }}
        >
          <Stack.Screen options={{ animation: "fade" }} name="(auth)/Welcome" />
          <Stack.Screen name="(auth)/Login" />
          <Stack.Screen name="(auth)/Register" />

          <Stack.Screen
            name="(auth)/DeleteAccount"
            options={{
              headerShown: true,
              headerTitle: "Delete account",
              headerTitleStyle: { color: "#fff" },
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/EmailVerification"
            options={{
              headerShown: true,
              headerTitle: "Email verification",
              headerTitleStyle: { color: "#fff" },
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/Verification"
            options={{
              headerShown: true,
              headerTitle: "Phone Verification",
              headerTitleStyle: { color: "#fff" },
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/SetPassword"
            options={{
              headerShown: true,
              headerTitle: "Set Password",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/VerifyReviewPassword"
            options={{
              headerShown: true,
              headerTitle: "Leave a review",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/AddReview"
            options={{
              headerShown: true,
              headerTitle: "Leave a review",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/AllReviews"
            options={{
              headerShown: true,
              headerTitle: "Reviews",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/PublishReview"
            options={{
              headerShown: true,
              headerTitle: "Leave a review",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/ChangePassword"
            options={{
              headerShown: true,
              headerTitle: "Reset password",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/AddTattoo"
            options={{
              headerShown: true,
              headerTitle: "Add tattoo",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/UploadTattoo"
            options={{
              headerShown: true,
              headerTitle: "Add tattoo",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/Notification"
            options={{
              headerShown: true,
              headerTitle: "Notifications",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/HelpAndSupport"
            options={{
              headerShown: true,
              headerTitle: "Help and support",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/Feedback"
            options={{
              headerShown: true,
              headerTitle: "Feedback",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/FeedbackSubmitted"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/ReviewPassword"
            options={{
              headerShown: true,
              headerTitle: "Change review password",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/TermsOfService"
            options={{
              headerShown: true,
              headerTitle: "Terms of service",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="(auth)/PrivacyPolicy"
            options={{
              headerShown: true,
              headerTitle: "Privacy policy",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen
            name="artist/MyProfile"
            options={{
              headerShown: true,
              headerTitle: "My Profile",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/ArtistProfile"
            options={{
              headerShown: true,
              headerTitle: "Artist",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/CreateReviewPassword"
            options={{
              headerShown: true,
              headerTitle: "Register as artist",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    router.back();
                  }}
                >
                  <Image
                    source={require("../assets/images/close.png")}
                    resizeMode="cover"
                    style={{ height: 13, width: 13 }}
                  />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen
            name="artist/SubscriptionInfo"
            options={{
              headerShown: false,
              headerTitle: "Register as artist",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/EditProfile"
            options={{
              headerShown: true,
              headerTitle: "Edit profile",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/EditProfileUser"
            options={{
              headerShown: true,
              headerTitle: "Edit profile",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/TattooDetail"
            options={{
              headerShown: true,
              headerTitle: "Portfolio",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/RegisterArtist"
            options={{
              headerShown: true,
              headerTitle: "Register as artist",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
              headerTitleAlign: "center",
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => {
                    router.back();
                  }}
                  hitSlop={20}
                >
                  <Image
                    source={require("../assets/images/close.png")}
                    resizeMode="cover"
                    style={{ height: 13, width: 13 }}
                  />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen
            name="artist/SearchLocation"
            options={{
              headerShown: true,
              headerTitle: "Add location",
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          {/* <Stack.Screen */}
          {/*   name="artist/SearchArtistProfiles" */}
          {/*   options={{ */}
          {/*     headerShown: false, */}
          {/*     // headerTitle: "Add location", */}
          {/*     headerTitleStyle: { color: "#fff" }, */}
          {/*     headerStyle: { backgroundColor: "#000" }, */}
          {/*     headerBackTitleVisible: false, */}
          {/*     headerBackButtonMenuEnabled: false, */}
          {/*     headerTintColor: "#fff", */}
          {/*   }} */}
          {/* /> */}
          <Stack.Screen
            name="artist/ShareProfile"
            options={{
              headerShown: false,
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/ShareReviewPassword"
            options={{
              headerShown: false,
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="artist/IndividualChat"
            options={{
              headerShown: false,
              headerTitleStyle: { color: "#fff" },
              headerStyle: { backgroundColor: "#000" },
              headerBackTitleVisible: false,
              headerBackButtonMenuEnabled: false,
              headerTintColor: "#fff",
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default AppNavigator;
