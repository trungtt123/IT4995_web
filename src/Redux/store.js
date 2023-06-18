import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import authReducer from "./authSlice";
import userInforReducer from "./userInforSlice";
import callReducer from "./callSlice";
import conversationReducer from "./conversationSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    call: callReducer,
    conversation: conversationReducer,
    infor: userInforReducer
  }
});
