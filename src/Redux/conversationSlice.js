import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";

export const updateConversation = createAction('updateConversation');


const initialState = {
  conversationData: false
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {},
  extraReducers: {
    [updateConversation]: (state, action) => {
        state.conversationData = action?.payload;
    }
  },
});

export default conversationSlice.reducer;
