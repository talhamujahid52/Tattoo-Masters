import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userSlice from "./slices/userSlice"; // Import your slice
import artistSlice from "./slices/artistSlice";
import chatSlice from "./slices/chatSlice";
import recentSearchesSlice from "./slices/recentSearchesSlice";
import tattooSlice from "./slices/tattooSlice";

// Persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  user: userSlice,
  artist: artistSlice,
  chats: chatSlice,
  recentSearches: recentSearchesSlice,
  tattoos: tattooSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // To avoid errors with Redux Persist
    }),
});

// Persistor
const persistor = persistStore(store);

export { store, persistor };

export type RootState = ReturnType<typeof rootReducer>; // Infers the shape of the Redux state
export type AppDispatch = typeof store.dispatch;
