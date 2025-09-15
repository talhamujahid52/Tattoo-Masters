import { useEffect } from "react";
import { useSelector } from "react-redux";
import { router } from "expo-router";

// Catch and handle links like myapp:///google/link that otherwise show Unmatched Route.
// We redirect users to a sensible screen instead of showing a 404.
export default function GoogleLinkCatcher() {
  const user = useSelector((state: any) => state?.user?.user);

  useEffect(() => {
    if (user?.uid) {
      router.replace("/(bottomTabs)/Home");
    } else {
      router.replace("/(auth)/Login");
    }
  }, [user?.uid]);

  return null;
}

