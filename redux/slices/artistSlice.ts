import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types for the state and the individual artist item
// interface Artist {
//   id: number;
//   name: string;
//   // Add any other properties that an artist might have
// }

interface ArtistState {
  allArtists: any[];
  loading: boolean;
}

// Initial state with types
const initialState: ArtistState = {
  allArtists: [],
  loading: false,
};

// Reducer
const artistSlice = createSlice({
  name: "artist",
  initialState: initialState,
  reducers: {
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
  },
});

export const { updateAllArtists, resetAllArtists } = artistSlice.actions;
const ArtistReducer = artistSlice.reducer;
export default ArtistReducer;
