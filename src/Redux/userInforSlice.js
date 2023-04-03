import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import userService from "../Services/Api/userService";

export const getUserInfo = createAsyncThunk("user/get_user_info", async (data, thunkAPI) => {
  try {
    const { user_id } = data;
    return await userService.getUserInfor(user_id);
  } catch (e) {
    console.log("error", e);
    return thunkAPI.rejectWithValue("something went wrong");
  }
});
export const resetUserInfoSlice = createAction('resetUserInfoSlice');

const initialState = {
  infor: null,
  isLoading: false,
};

const userInforSlice = createSlice({
  name: "userInfor",
  initialState,
  reducers: {},
  extraReducers: {
    [getUserInfo.pending]: (state) => {
      state.isLoading = true;
    },
    [getUserInfo.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.infor = action?.payload?.data;
    },
    [getUserInfo.rejected]: (state, action) => {
      state.isLoading = false;
    },
    [resetUserInfoSlice]: () => initialState
  },
});

export default userInforSlice.reducer;
