import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserStateType {
  user: FirebaseAuthTypes.User | null;
}
const initialState: UserStateType = {
  user: null, // Initially, no user is set
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload; // Set the user object from the action payload
    },
    resetUser: (state) => {
      state.user = null; // Reset user to null
    },
  },
});

export const { setUser, resetUser } = userSlice.actions; // Export actions
export default userSlice.reducer; // Export reducer
