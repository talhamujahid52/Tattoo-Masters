import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ArtistState {
  allArtists: any[];
  searchResults: any[]; // ← new
  loading: boolean;
}

const initialState: ArtistState = {
  allArtists: [],
  searchResults: [], // ← new
  loading: false,
};

const artistSlice = createSlice({
  name: "artist",
  initialState,
  reducers: {
    // your existing reducers — unchanged
    updateAllArtists: (state, action: PayloadAction<any[]>) => {
      action.payload.forEach((item) => {
        const itemIndex = state.allArtists.findIndex((b) => b.id === item.id);
        if (itemIndex === -1) {
          state.allArtists = [...state.allArtists, item];
        }
      });
    },
    resetAllArtists: (state) => {
      state.allArtists = [];
    },

    // ── NEW reducers for search ─────────────────────────────────
    updateSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    resetSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const {
  updateAllArtists,
  resetAllArtists,
  updateSearchResults, // ← new
  resetSearchResults, // ← new
} = artistSlice.actions;

export default artistSlice.reducer;
