// src/store/slices/recentSearchesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SearchType = "tattoos" | "studios" | "artists";

export interface SearchItem {
  text: string;
  type: SearchType;
}

interface RecentSearchesState {
  items: SearchItem[];
}

const MAX_ITEMS = 20;

const initialState: RecentSearchesState = {
  items: [],
};

const recentSearchesSlice = createSlice({
  name: "recentSearches",
  initialState,
  reducers: {
    /**
     * Add a new search (text + type).
     * • Trim whitespace from text; ignore if empty.
     * • Remove any existing identical (text+type).
     * • Unshift to front.
     * • Cap length at MAX_ITEMS.
     */
    addSearch: (state, action: PayloadAction<SearchItem>) => {
      const { text, type } = action.payload;
      const trimmed = text.trim();
      if (!trimmed) return;

      // remove duplicate of same text+type
      const idx = state.items.findIndex(
        (item) => item.text === trimmed && item.type === type
      );
      if (idx >= 0) {
        state.items.splice(idx, 1);
      }

      // add new one to front
      state.items.unshift({ text: trimmed, type });

      // cap length
      if (state.items.length > MAX_ITEMS) {
        state.items.pop();
      }
    },

    /** Clear all recent searches */
    clearSearches: (state) => {
      state.items = [];
    },
  },
});

export const { addSearch, clearSearches } = recentSearchesSlice.actions;
export default recentSearchesSlice.reducer;

/**
 * Selectors
 * • Get all recent searches.
 * • Get only those of a specific type.
 */
export const selectRecentSearches = (state: {
  recentSearches: RecentSearchesState;
}) => state.recentSearches.items;

export const selectSearchesByType =
  (type: SearchType) => (state: { recentSearches: RecentSearchesState }) =>
    state.recentSearches.items.filter((item) => item.type === type);
