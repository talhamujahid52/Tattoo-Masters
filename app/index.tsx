import { SplashScreen } from "expo-router";
import Welcome from "./(auth)/Welcome";

SplashScreen.preventAutoHideAsync();
export default function Index() {
  return <Welcome />;
}
