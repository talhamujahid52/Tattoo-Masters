import { useCallback, useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";

/**
 * Fetches tattoo style titles from Firestore Configurations/TattooStyles.
 * Centralized to avoid duplicating fetching logic across screens.
 */
const useTattooStyles = () => {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStyles = useCallback(async () => {
    setLoading(true);
    try {
      const doc = await firestore()
        .collection("Configurations")
        .doc("TattooStyles")
        .get();

      const data = doc.data();
      if (data?.styles && Array.isArray(data.styles)) {
        const fetched = data.styles
          .map((s: any) => s?.title)
          .filter((t: any) => typeof t === "string");
        setTitles(fetched);
      } else {
        setTitles([]);
      }
      setError(null);
    } catch (e: any) {
      console.error("Error fetching tattoo styles:", e);
      setError(e);
      setTitles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  return { titles, loading, error, refetch: fetchStyles };
};

export default useTattooStyles;

