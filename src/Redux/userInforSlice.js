import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";

export const resetUserInfoSlice = createAction('resetUserInfoSlice');

const initialState = {
  isCall: false,
};

const userInforSlice = createSlice({
  name: "userInfor",
  initialState,
  reducers: {},
  extraReducers: {
    
  },
});

export default userInforSlice.reducer;
