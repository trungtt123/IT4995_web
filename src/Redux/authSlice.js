import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import authService from "../Services/Api/authService";
import { delay } from '../Services/Helper/common'

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const { phonenumber, password } = data;
    return await authService.login(phonenumber, password);
  } catch (e) {
    console.log("error", e);
    return thunkAPI.rejectWithValue("something went wrong");
  }
});
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, thunkAPI) => {
    try {
      await delay(3000);
      return await authService.verifyToken();
    } catch (e) {
      console.log("error", e);
      await authService.logout();
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
  return await authService.logout();
  }
  catch(e){
    console.log(e);
  }
});
// actions
export const changeFirstLogin = createAction('changeFirstLogin');
export const removeLoginInfoInRedux = createAction('removeLoginInfoInRedux');
export const changeLoginWithCache = createAction('changeLoginWithCache');
export const resetAuthSlice = createAction('resetAuthSlice');
export const onChangeSocket = createAction('onChangeSocket');

const initialState = {
  user: null,
  isAuthenticated: null,
  isLoading: null,
  token: null,
  loginType: null, // 0: chưa login / login do sai sdt or pass, 1: login thành công, 2: tài khoản chưa xác thực
  loginPhonenumber: null,
  loginPassword: null,
  firstLogin: false, // true login lần đầu -> mở màn hình lưu thông tin đăng nhập
  loginWithCache: false,
  socket: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: {
    [login.pending]: (state, action) => {
      console.log('pending', action);
      state.isLoading = true;
      state.user = null;
      state.isAuthenticated = null;
      state.token = null;
      state.loginType = null;
      state.loginPhonenumber = action.meta.arg.phonenumber;
      state.loginPassword = action.meta.arg.password;
      state.firstLogin = null;
    },
    [login.fulfilled]: (state, action) => {
      console.log("actiion ful", action.payload);
      const payload = action.payload;
      state.isLoading = false;
      if (payload.code === '9995') {
        state.loginType = 2;
      }
      else {
        state.user = payload?.data;
        state.isAuthenticated = true;
        state.token = payload?.data?.token;
        state.loginType = 1;
        authService.setToken(payload?.data?.token);
        state.firstLogin = true;
      }
    },
    [login.rejected]: (state, action) => {
      console.log("action reject", action);
      state.isLoading = false;
      state.isAuthenticated = false;
      state.loginType = 0;
      state.loginPhonenumber = null;
      state.loginPassword = null;
    },
    [verifyToken.pending]: (state) => {
      console.log("pending");
      state.isLoading = true;
    },
    [verifyToken.fulfilled]: (state, action) => {
      console.log("actiion ful", action);
      const payload = action.payload;
      state.isLoading = false;
      if (action?.payload?.message == 'OK'){
        state.user = payload?.data;
        state.isAuthenticated = true;
      }
      else state.isAuthenticated = false;
      state.loginWithCache = true;
    },
    [verifyToken.rejected]: (state, action) => {
      console.log("action reject", action);
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.loginWithCache = false;
      logout();
    },
    [logout.fulfilled]: (state, action) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.loginType = null;
    },
    [changeFirstLogin]: (state) => {
      console.log('change first login')
      state.firstLogin = false;
    },
    [removeLoginInfoInRedux]: (state) => {
      console.log('removeLoginInfoInRedux')
      state.loginPhonenumber = null;
      state.loginPassword = null;
    },
    [changeLoginWithCache]: (state, action) => {
      state.loginWithCache = action.payload;
    },
    [onChangeSocket]: (state, action) => {
      state.socket = action.payload;
    },
    [resetAuthSlice]: () => initialState
  },
});

export const { } = authSlice.actions;

export default authSlice.reducer;
