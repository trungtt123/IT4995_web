import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import authReducer from "./authSlice";
import userInforReducer from "./userInforSlice";
import callReducer from "./callSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    infor: userInforReducer,
    call: callReducer
  }
});
