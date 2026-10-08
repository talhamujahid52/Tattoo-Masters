import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TattooStylesState {
  titles: string[];
}

const initialState: TattooStylesState = {
  titles: [],
};

const tattooStylesSlice = createSlice({
  name: "tattooStyles",
  initialState,
  reducers: {
    /**
     * Replace the cached style titles.
     * No-op when the list is unchanged, so subscribers don't re-render
     * on every background refresh.
     */
    setTattooStyleTitles: (state, action: PayloadAction<string[]>) => {
      const next = action.payload;
      const unchanged =
        next.length === state.titles.length &&
        next.every((title, idx) => title === state.titles[idx]);
      if (unchanged) return;

      state.titles = next;
    },
  },
});

export const { setTattooStyleTitles } = tattooStylesSlice.actions;
export default tattooStylesSlice.reducer;

export const selectTattooStyleTitles = (state: {
  tattooStyles: TattooStylesState;
}) => state.tattooStyles.titles;
