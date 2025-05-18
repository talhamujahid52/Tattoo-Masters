import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TattooSearchResult {
  document: {
    caption: string;
    deleteUrls: Record<string, string>;
    downloadUrls: Record<string, string>;
    id: string;
    styles: string[];
    timestamp: number;
    userId: string;
  };
}

interface TattooState {
  searchResults: TattooSearchResult[];
  loading: boolean;
}

const initialState: TattooState = {
  searchResults: [],
  loading: false,
};

const tattooSlice = createSlice({
  name: "tattoos",
  initialState,
  reducers: {
    setTattooSearchResults: (
      state,
      action: PayloadAction<TattooSearchResult[]>,
    ) => {
      state.searchResults = action.payload;
    },
    setTattooLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTattooSearchResults, setTattooLoading } = tattooSlice.actions;
export default tattooSlice.reducer;
