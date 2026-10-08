import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, Platform, Pressable, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";

interface ArtistMapMarkerProps {
  artist: any;
  onPress?: (artist: any) => void;
}

const ArtistMapMarker = ({ artist, onPress }: ArtistMapMarkerProps) => {
  const latitude = artist?.data?.location?.[0];
  const longitude = artist?.data?.location?.[1];
  const profilePic =
    artist?.data?.profilePictureSmall ?? artist?.data?.profilePicture;

  // While this is true the map re-snapshots the marker view continuously,
  // which makes the picture flicker. Only track until the image has drawn.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const stopTimer = useRef<ReturnType<typeof setTimeout>>();
  const stopTracking = useCallback(() => {
    if (Platform.OS !== "ios") {
      setTracksViewChanges(false);
      return;
    }
    // iOS keeps whatever was last drawn, and onLoad fires before the image is
    // painted, so stopping right away freezes the marker without its picture.
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => setTracksViewChanges(false), 500);
  }, []);

  useEffect(() => {
    setTracksViewChanges(true);
    return () => clearTimeout(stopTimer.current);
  }, [profilePic]);

  const coordinate = useMemo(
    () => ({ latitude, longitude }),
    [latitude, longitude]
  );

  if (!latitude || !longitude) return null;

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress ? () => onPress(artist) : undefined}
    >
      <Pressable style={styles.container}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require("../assets/images/placeholder.png")
          }
          // No fade-in, so the final snapshot isn't taken mid-fade on Android.
          fadeDuration={0}
          onLoad={stopTracking}
          onError={stopTracking}
          style={styles.image}
        />
      </Pressable>
    </Marker>
  );
};

export default memo(ArtistMapMarker);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#202020",
  },
});
