import { StyleSheet, View, Switch, Alert } from "react-native";
import Text from "@/components/Text";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { setUserFirestoreData } from "@/redux/slices/userSlice";
import { NotificationPreferences, UserFirestore } from "@/types/user";

type Preferences = {
  messages: boolean;
  favorites: boolean;
  likes: boolean;
};

const defaultPreferences: Preferences = {
  messages: true,
  favorites: true,
  likes: true,
};

const Notification = () => {
  const dispatch = useDispatch();
  const userFirestore: UserFirestore | null = useSelector(
    (state: any) => state.user.userFirestore,
  );

  const isArtist = Boolean(userFirestore?.isArtist);

  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const prefs: NotificationPreferences | undefined =
      userFirestore?.notificationPreferences;
    if (!prefs) {
      setPreferences(defaultPreferences);
      return;
    }

    setPreferences({
      messages: prefs.messages ?? true,
      favorites: prefs.favorites ?? true,
      likes: prefs.likes ?? true,
    });
  }, [userFirestore]);

  const persistPreferences = async (next: Preferences) => {
    if (!userFirestore?.uid) {
      setPreferences(next);
      return;
    }

    const prev = preferences;
    setPreferences(next);
    setIsSaving(true);
    try {
      await firestore()
        .collection("Users")
        .doc(userFirestore.uid)
        .update({ notificationPreferences: next });

      dispatch(
        setUserFirestoreData({
          ...userFirestore,
          notificationPreferences: next,
        }),
      );
    } catch (error) {
      console.error("Failed to update notification preferences", error);
      setPreferences(prev);
      Alert.alert(
        "Update failed",
        "Unable to save notification preferences. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAll = (value: boolean) => {
    if (isArtist) {
      persistPreferences({
        messages: value,
        favorites: value,
        likes: value,
      });
    } else {
      persistPreferences({
        ...preferences,
        messages: value,
      });
    }
  };

  const handleToggleSingle = (key: keyof Preferences) => (value: boolean) => {
    persistPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const allEnabled = useMemo(() => {
    if (!isArtist) return preferences.messages;
    return preferences.messages && preferences.favorites && preferences.likes;
  }, [isArtist, preferences]);

  const switchProps = (value: boolean) => ({
    trackColor: { false: "#767577", true: "#44e52c" },
    thumbColor: value ? "#fff" : "#f4f3f4",
    ios_backgroundColor: "#3e3e3e",
    disabled: isSaving,
  });

  return (
    <View style={{ padding: 16 }}>
      {isArtist && (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 24,
            borderBottomColor: "#262626",
            borderBottomWidth: 1,
          }}
        >
          <Text size="h4" weight="normal" color="#FBF6FA">
            All Notifications
          </Text>
          <Switch
            {...switchProps(allEnabled)}
            onValueChange={handleToggleAll}
            value={allEnabled}
          />
        </View>
      )}
      <View
        style={{
          display: "flex",
          rowGap: 24,
          paddingVertical: isArtist ? 24 : 0,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text size="h4" weight="normal" color="#FBF6FA">
            Messages
          </Text>
          <Switch
            {...switchProps(preferences.messages)}
            onValueChange={handleToggleSingle("messages")}
            value={preferences.messages}
          />
        </View>
        {isArtist && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text size="h4" weight="normal" color="#FBF6FA">
              Favorites
            </Text>
            <Switch
              {...switchProps(preferences.favorites)}
              onValueChange={handleToggleSingle("favorites")}
              value={preferences.favorites}
            />
          </View>
        )}
        {isArtist && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text size="h4" weight="normal" color="#FBF6FA">
              Likes
            </Text>
            <Switch
              {...switchProps(preferences.likes)}
              onValueChange={handleToggleSingle("likes")}
              value={preferences.likes}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({});
