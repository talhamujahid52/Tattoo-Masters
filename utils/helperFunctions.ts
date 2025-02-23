import { Dimensions, Platform, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const scale = Math.max(Math.min(SCREEN_HEIGHT / 956, 1), 0.8);
export function normalize(size: number) {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
}

export const formatMessageDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Check if the date is today
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    // Show time if it's today in 12-hour format with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  }

  // Check if the date is yesterday
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  // For older dates, show the full date (DD/MM/YYYY)
  return `${date.getDate() < 10 ? "0" : ""}${date.getDate()}/${
    date.getMonth() + 1 < 10 ? "0" : ""
  }${date.getMonth() + 1}/${date.getFullYear()}`;
}

export const getFileName = (fileUri: string): string => {
  return fileUri.split("/").pop() || "";
};
