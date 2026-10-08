import * as Location from "expo-location";
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

// Search results carry a position as [lat, lng], Firestore documents as
// { latitude, longitude }. Returns null when neither holds a usable position.
export const toLocationData = (location: unknown): LocationData | null => {
  const candidate = Array.isArray(location)
    ? { latitude: location[0], longitude: location[1] }
    : (location as LocationData | null | undefined);

  if (isUnsetLocation(candidate)) return null;
  return { latitude: candidate!.latitude, longitude: candidate!.longitude };
};

// What a pinned position resolves to: `city` is the short "City, Country"
// label shown on artist cards, `address` the exact address
export type PinnedPlace = { city: string; address: string };

// Android returns the full address ready made; elsewhere it is put together
// as "Street 1, 00100 City, Country"
const toExactAddress = (place: Location.LocationGeocodedAddress): string => {
  if (place.formattedAddress) return place.formattedAddress;

  const street = place.street
    ? [place.street, place.streetNumber].filter(Boolean).join(" ")
    : place.name;
  const cityLine = [place.postalCode, place.city || place.region]
    .filter(Boolean)
    .join(" ");
  return [street, cityLine, place.country].filter(Boolean).join(", ");
};

// Reverse geocodes a position. Null when nothing is known about it.
export const lookUpPlace = async ({
  latitude,
  longitude,
}: LocationData): Promise<PinnedPlace | null> => {
  const [found] = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (!found) return null;

  const city = found.city || found.region || "";
  return { city: `${city}, ${found.country}`, address: toExactAddress(found) };
};
