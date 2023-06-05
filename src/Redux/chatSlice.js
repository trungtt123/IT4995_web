import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";

export const callAction = createAction('callAction');

const initialState = {
  isCall: false
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {},
  extraReducers: {
    [callAction]: (state, action) => {
      state.isCall = action?.payload?.data;
    }
  },
});

export default callSlice.reducer;
