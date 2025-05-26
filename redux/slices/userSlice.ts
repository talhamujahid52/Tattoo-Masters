import { UserFirestore } from "@/types/user";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserStateType {
  user: FirebaseAuthTypes.User | null;
  userFirestore: UserFirestore | null;
}
const initialState: UserStateType = {
  user: null, // Initially, no user is set
  userFirestore: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload; // Set the user object from the action payload
    },

    setUserFirestoreData: (state, action: PayloadAction<any>) => {
      state.userFirestore = action.payload; // Set the user object from the action payload
    },
    resetUser: (state) => {
      state.user = null; // Reset user to null
      state.userFirestore = null; // Reset userFirestore to null
    },
  },
});

export const { setUser, resetUser, setUserFirestoreData } = userSlice.actions; // Export actions
export default userSlice.reducer; // Export reducer
