// store/filterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define filter-related types here
export interface Rating {
  title: string;
  value: number;
  selected: boolean;
}

export interface Studio {
  title: string;
  value: number;
  selected: boolean;
  name: string;
}

export interface Style {
  title: string;
  value: number;
  selected: boolean;
}

interface FilterState {
  isEnabledRadius: boolean;
  permissionDenied: boolean;
  radiusValue: number;
  ratings: Rating[];
  studio: Studio[];
  currentLocation?: { latitude: number; longitude: number };
  styles: Style[];
}
interface FilterState {
  isEnabledRadius: boolean;
  currentlyViewingArtist?: string;
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
    { title: "5 stars", value: 5, selected: false },
    { title: "4 stars", value: 4, selected: false },
    { title: "3 stars", value: 3, selected: false },
    { title: "2 stars", value: 2, selected: false },
    { title: "1 star", value: 1, selected: false },
  ],
  studio: [
    { title: "Studio", value: 1, selected: false, name: "studio" },
    { title: "Freelancer", value: 2, selected: false, name: "freelancer" },
    { title: "Home artist", value: 3, selected: false, name: "homeArtist" },
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
    setCurrentlyViewingArtist: (state, action: PayloadAction<string>) => {
      state.currentlyViewingArtist = action.payload;
    },
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
  setCurrentlyViewingArtist,
} = filterSlice.actions;

export const selectFilter = (state: RootState) => state.filter;

export default filterSlice.reducer;
