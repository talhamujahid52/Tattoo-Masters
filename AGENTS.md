# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Tattoo Masters is a cross-platform mobile app (iOS/Android) for discovering and booking tattoo artists. Built with React Native 0.76 + Expo SDK 52 + TypeScript. Backend is entirely Firebase (Auth, Firestore, Storage, Cloud Functions, Messaging).

## Common Commands

```bash
# Development
yarn start                # Start Expo dev server
yarn ios                  # Run on iOS (expo run:ios)
yarn android              # Run on Android (expo run:android)

# Testing
yarn test                 # Jest in watch mode (jest --watchAll)

# Linting
yarn lint                 # expo lint

# Native rebuild after config/plugin changes
npx expo prebuild

# EAS production builds
npx eas build --platform ios --local
npx eas build --platform android --local

# Cloud Functions (run from functions/ directory)
npm run build             # Compile TypeScript
npm run serve             # Build + run Firebase emulators
npm run deploy            # Deploy to Firebase
```

## Architecture

### Navigation (Expo Router, file-based)
- `app/_layout.tsx` — Root layout wrapping providers: Redux, PersistGate, ThemeProvider (dark), GestureHandlerRootView, BottomSheetModalProvider, FormProvider
- `app/AppNavigator.tsx` — Manages auth state listener (`onAuthStateChanged`), Firebase Dynamic Links, FCM notification handling (foreground/background/cold-start), renders the main `<Stack>`
- `app/(auth)/` — Auth screens (login, register, forgot password, OTP verification, etc.)
- `app/(bottomTabs)/` — 5-tab layout: Home, Search, Maps, Likes, Chat. Unauthenticated users see a login bottom sheet instead of navigating
- `app/artist/` — Artist/profile stack screens (profiles, uploads, chat, reviews, etc.)

### State Management
Redux Toolkit slices in `redux/slices/`:
- `userSlice` — Firebase Auth user + Firestore user document (`UserFirestore`)
- `artistSlice` — Artist listings and search results
- `chatSlice` — Chat list
- `tattooSlice` — Tattoo publications
- `filterSlices` — Search/filter state
- `uploadQueueSlice` — Background upload queue (not persisted)

All slices except `uploadQueueSlice` are persisted to AsyncStorage via redux-persist.

### Data Layer
- **No REST abstraction** — Direct Firestore SDK calls via utility functions in `utils/firebase/` and custom hooks in `hooks/`
- **Firestore collections**: `Users`, `Chats`, `publications`
- **Real-time listeners**: `onSnapshot` for chat lists and messages
- **Search**: Typesense client in `hooks/useTypesense.ts` for full-text search of tattoos and artists
- **Push notifications**: HTTP calls to a Firebase Cloud Function (`sendPushNotification`), authenticated with Firebase Auth ID tokens

### Key Patterns
- **Multi-step artist registration**: Uses `context/FormContext.tsx` with a 4-step wizard (Step1, Step2, Step3, StepperForm components)
- **Background uploads**: `utils/BackgroundUploadService.ts` queues image uploads with retry logic, state tracked in `uploadQueueSlice`
- **Authentication**: Email/password, Google Sign-In, Facebook SDK, phone OTP — all via Firebase Auth
- **Review passwords**: Separate artist-controlled hashed password for gating review submission

### Cloud Functions (`functions/src/`)
- `index.ts` — `sendPushNotification` HTTP function
- `cleanupUserData.ts` — User data cleanup
- `deleteUserAccount.ts` — Account deletion

## TypeScript

Strict mode enabled. Path alias `@/*` maps to project root. Types are in `types/user.ts` (UserFirestore, UserProfileFormData, etc.).

## Important Notes

- **Dark theme only** — `userInterfaceStyle: "dark"` in app.json, black backgrounds throughout
- **patch-package** runs on `postinstall` — check `patches/` directory for active patches
- **Custom Expo plugins** in `plugin/` for Facebook SDK integration
- **Two context directories** — `context/` (FormContext) and `contexts/` (DrawerContext) coexist
- **API keys are hardcoded** in source (Typesense in `hooks/useTypesense.ts`, Google Maps in `app.json`) — no `.env` file
