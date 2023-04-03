import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import userService from "../Services/Api/userService";
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      return await userService.getAllUsers();
    } catch (e) {
      console.log("error", e);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);

export const getUserInfo = createAsyncThunk("user/get_user_info", async (data, thunkAPI) => {
  try {
    const { user_id } = data;
    return await userService.getUserInfor(user_id);
  } catch (e) {
    console.log("error", e);
    return thunkAPI.rejectWithValue("something went wrong");
  }
});

export const setUserInfo = createAsyncThunk("user/set_user_info", async (data, thunkAPI) => {
  try {
    const { userId, des } = data;
    return await userService.setUserDescription(des, userId);
  } catch (e) {
    console.log("error", e);
    return thunkAPI.rejectWithValue("something went wrong");
  }
});

export const setUserName = createAsyncThunk("user/set_user_info", async (data, thunkAPI) => {
  try {
    const { userName } = data;
    return await userService.setUserName(userName);
  } catch (e) {
    console.log("error", e);
    return thunkAPI.rejectWithValue("something went wrong");
  }
});

export const setAvatar  = createAsyncThunk(
  "user/set_user_info", async (data, thunkAPI) => {
    try {
      return await userService.setAvatar(data);
    } catch (e) {
      console.log("error", e.response);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
)

export const setCoverImage  = createAsyncThunk(
  "user/set_user_info", async (data, thunkAPI) => {
    try {
      return await userService.setCoverImage(data);
    } catch (e) {
      console.log("error", e.response);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
)

export const setUserCity  = createAsyncThunk(
  "user/set_user_info", async (data, thunkAPI) => {
    try {
      return await userService.setUserCity(data);
    } catch (e) {
      console.log("error", e);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
)

export const setUserCountry  = createAsyncThunk(
  "user/set_user_info", async (data, thunkAPI) => {
    try {
      return await userService.setUserCountry(data);
    } catch (e) {
      console.log("error", e);
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
)
export const resetStatusSetUser = createAction('resetStatusSetUser');

export const resetUserInfor = createAction('resetUserInfor');
export const resetInforWithData = createAction('reset');
export const resetUserSlice = createAction('resetUserSlice');
const initialState = {
  userList: [],
  isLoading: false,
  userInfor: null,
  isErrorUpdateUserName: null,
  successChangeCover: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: {
    [fetchAllUsers.pending]: (state) => {
      console.log("pending");
      state.isLoading = true;
    },
    [fetchAllUsers.fulfilled]: (state, action) => {
      console.log("actiion ful", action);
      state.isLoading = false;
      state.userList = action?.payload?.data;
    },
    [fetchAllUsers.rejected]: (state, action) => {
      console.log("action rej", action);
      state.isLoading = false;
    },
    [getUserInfo.pending]: (state) => {
      state.isLoading = true;
    },
    [getUserInfo.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.userInfor = action?.payload?.data;
    },
    [getUserInfo.rejected]: (state, action) => {
      state.isLoading = false;
    },

    [setAvatar.pending] : (state) => {
      state.isLoading = true;
    },
    [setAvatar.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.userInfor = action?.payload?.data;
    },
    [setAvatar.rejected]: (state, action) => {
      state.isLoading = false;
    },
    [resetUserInfor]: (state, action) => {
      state.userInfor = null
    },
    [setUserName.pending] : (state) => {
      state.isLoading = true;
      state.isErrorUpdateUserName = null;
    },
    [setUserName.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.userInfor = action?.payload?.data;
      state.isErrorUpdateUserName = false;
    },
    [setUserName.rejected]: (state, action) => {
      state.isLoading = false;
      state.isErrorUpdateUserName = true;
    },
    [resetStatusSetUser]: (state, action) => {
      state.isErrorUpdateUserName = null;
    },
    [resetInforWithData]: (state, action) => {
      state.userInfor = action?.payload?.data;
    },
    [resetUserSlice]: () => initialState
  },
});

export default userSlice.reducer;
