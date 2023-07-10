import axios from "../../setups/custom_axios";
import { _getCache, _setCache } from "../Helper/common";
const login = async (phonenumber, password) => {
  console.log(password, phonenumber);
  return axios.post(`/auth/login?phonenumber=${phonenumber}&password=${password}`);
};
const signup = async (phonenumber, password, name, birthday,) => {
  return axios.post(`/auth/signup?phonenumber=${phonenumber}&password=${password}&name=${name}&birthday=${birthday}`);
};
const changePassword = async (password, newPassword) => {
  return axios.post(`/auth/change_password?password=${password}&new_password=${newPassword}`);
}
const checkExistPhoneNumber = async (phonenumber) => {
  console.log(phonenumber);
  return axios.post(`/auth/checkexistphonenumber?phonenumber=${phonenumber}`);
}
const checkVerifyCode = async (phonenumber, code) => {
  console.log(phonenumber, code);
  return axios.post(`/auth/check_verify_code?phonenumber=${phonenumber}&code_verify=${code}`);
}
const getVerifyCode = async (phonenumber) => {
  console.log(phonenumber);
  return axios.post(`/auth/get_verify_code?phonenumber=${phonenumber}`);
}
const verifyToken = async () => {
  return axios.get(`/auth/verifyToken`);
}
const logout = async () => {
  // remove token
  try {
    await _setCache("token", "");
    await _setCache("user", "");
    return axios.post(`/auth/logout`);
  }
  catch (e) {
    console.log(e);
  }
  // call api remove token
};
const setToken = async (token) => {
  try {
    await _setCache("token", token);
  }
  catch (e) {
    console.log(e);
  }
};
const getToken = async () => {
  try {
    return await _getCache("token");
  }
  catch (e) {
    console.log(e);
  }
};
const saveLoginInfo = async (user) => {
  try {
    console.log(user);
    let loginInfo = JSON.parse(await _getCache("loginInfo"));
    if (loginInfo === null || loginInfo === undefined || loginInfo === "") loginInfo = [];
    let listPhoneNumber = loginInfo.map(o => o.phonenumber);
    let index = listPhoneNumber.indexOf(user.phonenumber);
    if (index === -1) loginInfo.push(user);
    else {
      loginInfo[index] = user;
    }
    // remove cache
    // await _setCache("loginInfo", "");
    await _setCache("loginInfo", JSON.stringify(loginInfo));
  }
  catch (e) {
    console.log(e);
  }
}
const getListLoginInfo = async () => {
  try {
    let loginInfo = JSON.parse(await _getCache("loginInfo"));
    if (loginInfo === null || loginInfo === undefined || loginInfo === "") loginInfo = [];
    return loginInfo;
  }
  catch(e){
    console.log(e);
  }
}
const removeLoginInfo = async (user) => {
  try {
    let loginInfo = await getListLoginInfo();
    let index = loginInfo.map(o => o.phonenumber).indexOf(user.phonenumber);
    if (index !== -1){
      loginInfo.splice(index, 1);
    }
    await _setCache("loginInfo", JSON.stringify(loginInfo));
    console.log(loginInfo);
  }
  catch(e){
    console.log(e);
  }
}
const authService = {
  login, logout, verifyToken, setToken,
  getToken, signup, checkExistPhoneNumber, checkVerifyCode,
  getVerifyCode, saveLoginInfo, getListLoginInfo,
  removeLoginInfo, changePassword
};
export default authService;
