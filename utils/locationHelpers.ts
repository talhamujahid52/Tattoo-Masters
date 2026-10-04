import type { Region } from "react-native-maps";
import { LocationData } from "@/types/user";

// Where maps open when there is no saved location and the user has not shared
// theirs: the whole of Finland.
export const FINLAND_REGION: Region = {
  latitude: 64.95,
  longitude: 26.07,
  latitudeDelta: 11,
  longitudeDelta: 12,
};

// True when there is no usable position: missing, the 0,0 placeholder, or
// coordinates that are not real numbers within range.
export const isUnsetLocation = (location?: LocationData | null): boolean => {
  if (!location) return true;

  const { latitude, longitude } = location;
  return (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    (latitude === 0 && longitude === 0)
  );
};
