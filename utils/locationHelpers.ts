import { LocationData } from "@/types/user";

export const isUnsetLocation = (location?: LocationData | null): boolean =>
  !location ||
  (location.latitude === 0 && location.longitude === 0);
