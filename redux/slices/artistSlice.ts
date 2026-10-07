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

    updateSingleArtist: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const { id, data } = action.payload;
      const index = state.allArtists.findIndex((a) => a.id === id);
    
      if (index !== -1) {
        state.allArtists[index] = { id, data }; // replace existing entry
      } else {
        state.allArtists.push({ id, data }); // add if missing
      }
    },

    resetAllArtists: (state) => {
      state.allArtists = [];
    },

    // Replace the whole list in one dispatch. Dispatching reset + update
    // separately renders an empty list in between, which unmounts every
    // card and makes the images reload (visible flash).
    setAllArtists: (state, action: PayloadAction<any[]>) => {
      const seen = new Set<string>();
      state.allArtists = action.payload.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
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
  updateSingleArtist,
  resetAllArtists,
  setAllArtists,
  updateSearchResults, // ← new
  resetSearchResults, // ← new
} = artistSlice.actions;

export default artistSlice.reducer;
