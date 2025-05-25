// store/filterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rating, Studio, Style } from "../types"; // define these item types
import { RootState } from "../store";

interface FilterState {
  isEnabledRadius: boolean;
  permissionDenied: boolean;
  radiusValue: number;
  ratings: Rating[];
  studio: Studio[];
  currentLocation?: { latitude: number; longitude: number };
  styles: Style[];
}

const initialState: FilterState = {
  isEnabledRadius: false,
  permissionDenied: false,
  radiusValue: 50,
  ratings: [
    { title: "1 star", value: 1, selected: true },
    { title: "2 stars", value: 2, selected: false },
    { title: "3 stars", value: 3, selected: false },
    { title: "4 stars", value: 4, selected: false },
    { title: "5 stars", value: 5, selected: false },
  ],
  studio: [
    { title: "Studio", value: 1, selected: false },
    { title: "Freelancer", value: 2, selected: false },
    { title: "Home Artist", value: 3, selected: false },
  ],
  styles: [
    { title: "Tribal", value: 1, selected: false },
    { title: "Geometric", value: 2, selected: false },
    { title: "Black and White", value: 3, selected: false },
  ],
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setRadiusEnabled(state, action: PayloadAction<boolean>) {
      state.isEnabledRadius = action.payload;
    },
    setPermissionDenied(state, action: PayloadAction<boolean>) {
      state.permissionDenied = action.payload;
    },
    setRadiusValue(state, action: PayloadAction<number>) {
      state.radiusValue = action.payload;
    },
    setRatings(state, action: PayloadAction<Rating[]>) {
      state.ratings = action.payload;
    },
    setStudio(state, action: PayloadAction<Studio[]>) {
      state.studio = action.payload;
    },
    setStyles(state, action: PayloadAction<Style[]>) {
      state.styles = action.payload;
    },
    setCurrentLocation(
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>,
    ) {
      state.currentLocation = action.payload;
    },
  },
});

export const {
  setRadiusEnabled,
  setPermissionDenied,
  setRadiusValue,
  setRatings,
  setStudio,
  setStyles,
  setCurrentLocation,
} = filterSlice.actions;

export const selectFilter = (state: RootState) => state.filter;

export default filterSlice.reducer;
