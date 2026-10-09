import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import firestore from "@react-native-firebase/firestore";

// Firestore caps "in" queries at 30 values
const IN_QUERY_LIMIT = 30;

export interface RealtimeDoc {
  id: string;
  data: any;
}

const chunkIds = (ids: string[]) => {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += IN_QUERY_LIMIT) {
    chunks.push(ids.slice(i, i + IN_QUERY_LIMIT));
  }
  return chunks;
};

const queryByIds = (collection: string, ids: string[]) =>
  firestore()
    .collection(collection)
    .where(firestore.FieldPath.documentId(), "in", ids);

/**
 * Custom hook to listen for realtime updates on a set of documents by ID.
 * The IDs are split across as many "in" queries as needed, so the list can
 * be any length. Documents come back in the same order as the IDs.
 *
 * @param collection The collection the documents live in.
 * @param ids The document IDs to listen to.
 * @returns An object with docs, loading, error and a refresh function.
 */
export const useRealtimeDocsByIds = (
  collection: string,
  ids: string[] | undefined,
) => {
  // Keyed on the IDs themselves, so a new array with the same IDs
  // doesn't tear down and recreate the listeners
  const idsKey = useMemo(
    () => Array.from(new Set((ids ?? []).filter(Boolean))).join("/"),
    [ids],
  );
  const latestIdsKey = useRef(idsKey);
  latestIdsKey.current = idsKey;

  const [docsById, setDocsById] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const uniqueIds = idsKey ? idsKey.split("/") : [];
    if (uniqueIds.length === 0) {
      setDocsById({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const chunks = chunkIds(uniqueIds);
    const chunkDocs: (Record<string, any> | null)[] = chunks.map(() => null);

    // Wait for every chunk before publishing, so the list doesn't fill in piecemeal
    const publish = () => {
      if (chunkDocs.some((docs) => docs === null)) return;
      setDocsById(Object.assign({}, ...chunkDocs));
      setLoading(false);
    };

    const unsubscribes = chunks.map((chunk, index) =>
      queryByIds(collection, chunk).onSnapshot(
        (snapshot) => {
          chunkDocs[index] = Object.fromEntries(
            (snapshot?.docs ?? []).map((doc) => [doc.id, doc.data()]),
          );
          setError(null);
          publish();
        },
        (err) => {
          console.error(`Error listening to ${collection}:`, err);
          setError(err);
          chunkDocs[index] = chunkDocs[index] ?? {};
          publish();
        },
      ),
    );

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [collection, idsKey]);

  // Force a read from the server, for pull-to-refresh. Pass `ids` when the
  // caller has just re-read the ID list itself and wants those documents
  // loaded before it resolves, ahead of the listeners catching up.
  const refresh = useCallback(async (ids?: string[]) => {
    const uniqueIds = ids
      ? Array.from(new Set(ids.filter(Boolean)))
      : idsKey
        ? idsKey.split("/")
        : [];
    if (uniqueIds.length === 0) {
      if (ids) setDocsById({});
      return;
    }
    try {
      const snapshots = await Promise.all(
        chunkIds(uniqueIds).map((chunk) =>
          queryByIds(collection, chunk).get({ source: "server" }),
        ),
      );
      // The IDs changed while this was loading; the new listeners win
      if (!ids && latestIdsKey.current !== idsKey) return;
      setDocsById(
        Object.fromEntries(
          snapshots.flatMap((snapshot) =>
            snapshot.docs.map((doc) => [doc.id, doc.data()]),
          ),
        ),
      );
      setError(null);
    } catch (err: any) {
      console.error(`Error refreshing ${collection}:`, err);
      setError(err);
    }
  }, [collection, idsKey]);

  // Filtered by the current IDs, so a removed one disappears straight away
  const docs: RealtimeDoc[] = useMemo(
    () =>
      (idsKey ? idsKey.split("/") : [])
        .filter((id) => docsById[id])
        .map((id) => ({ id, data: docsById[id] })),
    [idsKey, docsById],
  );

  return { docs, loading, error, refresh };
};
