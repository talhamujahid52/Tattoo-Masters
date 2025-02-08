import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatsState {
  allChats: any[];
  loading: boolean;
}

// Initial state with types
const initialState: ChatsState = {
  allChats: [],
  loading: false,
};

// Reducer
const chatSlice = createSlice({
  name: "chats",
  initialState: initialState,
  reducers: {
    updateAllChats: (state, action: PayloadAction<any[]>) => {
      state.allChats = [...action.payload];
    },
    resetAllChats: (state) => {
      state.allChats = [];
    },
  },
});

export const { updateAllChats, resetAllChats } = chatSlice.actions;
const ChatReducer = chatSlice.reducer;
export default ChatReducer;
