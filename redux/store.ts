import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userSlice from "./slices/userSlice"; // Import your slice

// Persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  user: userSlice,
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