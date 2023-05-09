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
import { REST_API_URL } from "../Services/Helper/constant";
import ConfirmModal from "../Components/ConfirmModal";
import userService from "../Services/Api/userService";
import { _setCache, getTimeUnixTimeStamp } from "../Services/Helper/common";
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
            setError('Hãy nhập đủ thông tin');
            return;
        }
        if (newPassword !== confirmNewPass) {
            setError('Xác nhận mật khẩu không khớp');
            return;
        }
        axios.post(`/auth/change_password?password=${oldPassword}&new_password=${newPassword}`).then(() => {
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
                    primary={'Cập nhật thành công'}
                    secondary={'Đăng nhập lại để tiếp tục'}
                />
            }
            <div style={{
                textAlign: 'center',
                padding: '50px 20px'
            }}>
                <div style={{ margin: 10 }}>
                    <TextField
                        type="password"
                        value={oldPassword}
                        style={{ width: '100%' }}
                        id="outlined-basic" label="Mật khẩu hiện tại" variant="outlined"
                        onChange={(e) => setOldPassword(e.target.value)} />
                </div>
                <div style={{ margin: 10 }}>
                    <TextField
                        type="password"
                        value={newPassword}
                        style={{ width: '100%' }}
                        id="outlined-basic" label="Mật khẩu mới" variant="outlined"
                        onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div style={{ margin: 10 }}>
                    <TextField
                        type="password"
                        value={confirmNewPass}
                        style={{ width: '100%' }}
                        id="outlined-basic" label="Xác nhận mật khẩu mới" variant="outlined"
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
