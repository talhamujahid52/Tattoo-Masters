import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";

type ArtistStatus = "pending" | "done" | "missing" | "error";

/**
 * Live artist from the Users collection. The Redux list only holds artists
 * loaded on the Search tab (and can be stale), so it is only used to show
 * something while the Firestore document loads, or if it fails to load.
 *
 * @returns The artist ({ id, data }) plus whether it is still loading or
 * couldn't be found.
 */
export const useArtist = (artistId: string | string[] | undefined) => {
  const id = Array.isArray(artistId) ? artistId[0] : artistId;
  const cachedArtist = useSelector((state: any) =>
    id
      ? state.artist.allArtists.find((item: any) => item.id === id)
      : undefined,
  );
  // Tagged with the ID it was loaded for, so a previous artist never leaks
  // into the next one while it loads
  const [live, setLive] = useState<{
    id: string;
    artist: any;
    status: ArtistStatus;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    return firestore()
      .collection("Users")
      .doc(id)
      .onSnapshot(
        (snap) => {
          setLive(
            snap.exists
              ? { id, artist: { id: snap.id, data: snap.data() }, status: "done" }
              : { id, artist: null, status: "missing" },
          );
        },
        (err) => {
          console.error("Artist listener error:", err);
          setLive({ id, artist: null, status: "error" });
        },
      );
  }, [id]);

  const status: ArtistStatus = !id
    ? "missing"
    : live?.id === id
      ? live.status
      : "pending";
  // A deleted artist stays gone even if the cache still has them
  const artist =
    status === "done"
      ? live!.artist
      : status === "missing"
        ? null
        : cachedArtist ?? null;

  return {
    artist,
    isLoading: !artist && status === "pending",
    isMissing: !artist && status !== "pending",
  };
};

const useGetArtist = (artistId: string | string[] | undefined) =>
  useArtist(artistId).artist;

export default useGetArtist;
