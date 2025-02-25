import { useState, useCallback } from "react";
import Typesense from "typesense";
// Define the structure of your publication document
export interface Publication {
  caption: string;
  deleteUrls: {
    high: string;
    medium: string;
    small: string;
    veryHigh: string;
  };
  downloadUrls: {
    high: string;
    medium: string;
    small: string;
    veryHigh: string;
  };
  id: string;
  styles: string[];
  timestamp: number;
  userId: string;
}
// Define the structure of a search hit from Typesense, making some fields optional
export interface TypesenseResult<T> {
  document: T;
  highlight?: Record<string, unknown>;
  highlights: any[];
  text_match: number;
  text_match_info?: {
    best_field_score: string;
    best_field_weight: number;
    fields_matched: number;
    num_tokens_dropped?: number;
    score: string;
    tokens_matched: number;
    typo_prefix_score?: number;
  };
}

interface SearchParams {
  collection: string;
  query?: string;
  /**
   * Comma-separated list of fields to query.
   * Defaults to "caption,styles" if not provided.
   */
  queryBy?: string;
  /**
   * Optional filter_by parameter (e.g. "isArtist:=true")
   */
  filterBy?: string;
}

interface GetDocumentParams {
  collection: string;
  documentId: string;
}

// Baked-in configuration for your Typesense instance
const client = new Typesense.Client({
  nodes: [
    {
      host: "wi0ecngpr2q43hz9p-1.a1.typesense.net",
      port: 443,
      protocol: "https",
    },
  ],
  apiKey: "m9ha4JfGUemJ8dZJI1k3weikrjzaizgg",
  connectionTimeoutSeconds: 60,
});

const useTypesense = () => {
  const [results, setResults] = useState<TypesenseResult<any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Perform a search on a given collection.
   * Returns an array of search hits with Publication documents.
   */
  const search = useCallback(
    async ({
      collection,
      query,
      queryBy,
      filterBy,
    }: SearchParams): Promise<TypesenseResult<any>[]> => {
      setLoading(true);
      try {
        const response = await client
          .collections(collection)
          .documents()
          .search({
            q: query ?? "",
            query_by: queryBy ?? "caption,styles",
            filter_by: filterBy, // pass the filterBy parameter here
          });
        const hits = response.hits as TypesenseResult<any>[];
        setResults(hits);
        setError(null);
        return hits;
      } catch (err: any) {
        console.error("Typesense search error:", err);
        setError(err);
        setResults([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch a single document by ID from a given collection.
   * Returns the Publication document.
   */
  const getDocument = useCallback(
    async ({ collection, documentId }: GetDocumentParams): Promise<any> => {
      setLoading(true);
      try {
        const document = await client
          .collections(collection)
          .documents(documentId)
          .retrieve();
        setError(null);
        return document;
      } catch (err: any) {
        console.error("Typesense getDocument error:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { results, loading, error, search, getDocument };
};

export default useTypesense;
