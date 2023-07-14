import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Redux/authSlice";
import { OutlinedInput, TextField, Button } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import default_avatar from '../Assets/images/default_avatar.jpg'
import { useHistory } from "react-router-dom";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from '../setups/custom_axios';
import { REST_API_URL, TEXT_COMMON } from "../Services/Helper/constant";
import ConfirmModal from "../Components/ConfirmModal";
import userService from "../Services/Api/userService";
import { _setCache, getTimeUnixTimeStamp } from "../Services/Helper/common";
import HeaderScreen from "../Components/HeaderScreen";
import authService from "../Services/Api/authService";
const ChangePassword = (props) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { user } = useSelector(
        (state) => state.auth
    );
    const [oldPassword, setOldPassword] = useState();
    const [newPassword, setNewPassword] = useState();
    const [confirmNewPass, setConfirmNewPass] = useState();
    const [isShowModal, setIsShowModal] = useState(false);
    const [error, setError] = useState();
    const handleSubmit = () => {
        if (!oldPassword || !newPassword || !confirmNewPass) {
            setError(TEXT_COMMON.PLEASE_ENTER_ALL_INFORMATION_LOWERCASE);
            return;
        }
        if (newPassword !== confirmNewPass) {
            setError(TEXT_COMMON.PASSWORD_CONFIRMATION_DOES_NOT_MATCH_LOWERCASE);
            return;
        }
        authService.changePassword(oldPassword, newPassword).then(() => {
            setIsShowModal(true);
        }).catch(e => {
            console.error(e);
        })
    }
    useEffect(() => {
    }, []);
    return (
        <>
            {
                isShowModal && <ConfirmModal
                    isShowReject={false}
                    onAccept={() => window.location.href = '/'}
                    primary={TEXT_COMMON.UPDATE_SUCCESSFUL_LOWERCASE}
                    secondary={TEXT_COMMON.LOG_IN_AGAIN_TO_CONTINUE_LOWERCASE}
                />
            }
            <HeaderScreen title={"Đổi mật khẩu"}/>
            <div style={{
                textAlign: 'center',
                padding: '50px 20px',
                marginTop: 20
            }}>
                <div style={{ margin: 10 }}>
                    <TextField
                        type="password"
                        value={oldPassword}
                        style={{ width: '100%' }}
                        id="oldPassword" label="Mật khẩu hiện tại" variant="outlined"
                        onChange={(e) => setOldPassword(e.target.value)} />
                </div>
                <div style={{ margin: 10 }}>
                    <TextField
                        type="password"
                        value={newPassword}
                        style={{ width: '100%' }}
                        id="newPassword" label="Mật khẩu mới" variant="outlined"
                        onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div style={{ margin: 10 }}>
                    <TextField
                        type="password"
                        value={confirmNewPass}
                        style={{ width: '100%' }}
                        id="confirmNewPass" label="Xác nhận mật khẩu mới" variant="outlined"
                        onChange={(e) => setConfirmNewPass(e.target.value)} />
                </div>
                <div style={{ fontSize: 15, color: 'red', textAlign: 'left', marginLeft: 10 }}>{error}</div>
                <div style={{ margin: 10 }}>
                    <Button onClick={() => handleSubmit()} style={{ width: '100%' }} variant="contained">
                        Cập nhật
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;
