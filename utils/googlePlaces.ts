import { GOOGLE_MAPS_API_KEY } from "@/constants/Config";
import { LocationData } from "@/types/user";
import { PinnedPlace } from "@/utils/locationHelpers";

const PLACES_API = "https://maps.googleapis.com/maps/api/place";
const COMMON_QUERY = `key=${GOOGLE_MAPS_API_KEY}&language=en`;

export type PlaceSuggestion = { place_id: string; description: string };

type AddressComponent = { long_name: string; types: string[] };

// The short "City, Country" label shown on artist cards
export const toCityLabel = (components: AddressComponent[]): string => {
  const find = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name || null;

  const city =
    find("locality") ||
    find("administrative_area_level_2") ||
    find("administrative_area_level_1");
  return [city, find("country")].filter(Boolean).join(", ");
};

// Address suggestions for what has been typed so far
export const searchPlaces = async (
  text: string
): Promise<PlaceSuggestion[]> => {
  const response = await fetch(
    `${PLACES_API}/autocomplete/json?input=${encodeURIComponent(
      text
    )}&${COMMON_QUERY}`
  );
  const json = await response.json();
  return json.status === "OK" ? json.predictions : [];
};

// Where a suggestion is and what it is called. Null if it cannot be found.
export const getPlace = async (
  placeId: string
): Promise<(PinnedPlace & { location: LocationData }) | null> => {
  const response = await fetch(
    `${PLACES_API}/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=geometry,address_components,formatted_address&${COMMON_QUERY}`
  );
  const { status, result } = await response.json();
  const position = result?.geometry?.location;
  if (status !== "OK" || !position) return null;

  return {
    location: { latitude: position.lat, longitude: position.lng },
    city: toCityLabel(result.address_components ?? []),
    address: result.formatted_address ?? "",
  };
};
