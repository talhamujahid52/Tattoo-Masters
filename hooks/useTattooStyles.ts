import { useCallback, useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";
import {
  selectTattooStyleTitles,
  setTattooStyleTitles,
} from "@/redux/slices/tattooStylesSlice";

// Styles rarely change, so the persisted list is served immediately and only
// refreshed from Firestore in the background once this window has passed.
const REVALIDATE_AFTER_MS = 60 * 60 * 1000;

let lastFetchedAt = 0;
let inFlight: Promise<string[]> | null = null;

// Shared across hook instances so concurrent mounts trigger a single read.
const fetchStyleTitles = (): Promise<string[]> => {
  if (!inFlight) {
    inFlight = firestore()
      .collection("Configurations")
      .doc("TattooStyles")
      .get()
      .then((doc) => {
        const data = doc.data();
        const titles: string[] =
          data?.styles && Array.isArray(data.styles)
            ? data.styles
                .map((s: any) => s?.title)
                .filter((t: any) => typeof t === "string")
            : [];
        lastFetchedAt = Date.now();
        return titles;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};

/**
 * Warms the style cache at app start so the list is already there the first
 * time a screen needs it. Failures are left for the hook to retry on mount.
 */
export const prefetchTattooStyles = async (dispatch: Dispatch) => {
  try {
    dispatch(setTattooStyleTitles(await fetchStyleTitles()));
  } catch (e) {
    console.error("Error prefetching tattoo styles:", e);
  }
};

/**
 * Tattoo style titles from Firestore Configurations/TattooStyles.
 * Centralized to avoid duplicating fetching logic across screens.
 * Titles are cached in redux (persisted), so they are available on first
 * render; Firestore is only consulted when the cache is empty or stale.
 */
const useTattooStyles = () => {
  const dispatch = useDispatch();
  const titles = useSelector(selectTattooStyleTitles);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStyles = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await fetchStyleTitles();
      dispatch(setTattooStyleTitles(fetched));
      setError(null);
    } catch (e: any) {
      // Keep whatever is cached; a failed refresh shouldn't empty the list
      console.error("Error fetching tattoo styles:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const isFresh = Date.now() - lastFetchedAt < REVALIDATE_AFTER_MS;
    if (titles.length > 0 && isFresh) return;
    fetchStyles();
    // Only on mount: the cache itself changing must not trigger a refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { titles, loading, error, refetch: fetchStyles };
};

export default useTattooStyles;
