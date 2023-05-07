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
import { getTimeUnixTimeStamp } from "../Services/Helper/common";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
const Profile = (props) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { user } = useSelector(
        (state) => state.auth
    );
    const initUserData = useRef({});
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [pass, setPass] = useState();
    const [avatar, setAvatar] = useState();
    const [fileAvatar, setFileAvatar] = useState();
    const [birthday, setBirthday] = useState(dayjs(new Date()));
    const [confirmPass, setConfirmPass] = useState();
    const [isShowPass, setIsShowPass] = useState(false);
    const [isShowConfirmPass, setIsShowConfirmPass] = useState(false);
    const [error, setError] = useState();
    const [isShowModal, setIsShowModal] = useState(false);
    const inputAvatar = useRef();
    const handleChangeAvatar = (e) => {
        console.log(e.target.files);
        setFileAvatar(e.target.files[0]);
        setAvatar(URL.createObjectURL(e.target.files[0]));
    }
    const handleSubmit = () => {
        if (!name) {
            setError('Hãy nhập họ và tên');
            return;
        }
        if (pass !== confirmPass) {
            setError('Xác nhận mật khẩu không khớp');
            return;
        }
        if (!birthday) {
            setError('Hãy chọn ngày sinh của bạn');
        }
        const dateString = birthday.$y + "-" + (birthday.$M + 1) + "-" + birthday.$D;
        const formData = new FormData();
        formData.append("avatar", fileAvatar);
        axios.post(`/user/set_user_info?username=${name}&birthday=${dateString}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }}).then(() => {
            setIsShowModal(true);
        }).catch(e => {
            console.error(e);
        })
    }
    useEffect(() => {
        userService.getUserInfor(user.id).then((result) => {
            console.log('getUserInfor', result.data);
            const userData = result.data;
            initUserData.current = userData;
            setName(userData.username);
            setPhone(userData.phoneNumber);
            setAvatar(userData.avatar);
            setBirthday(dayjs(new Date(getTimeUnixTimeStamp(userData.birthday))));
        }).catch(e => {
            console.log(e);
        })
    }, []);
    return (
        <>
            {
                isShowModal && <ConfirmModal
                    isShowReject={false}
                    onAccept={() => history.push('/')}
                    onReject={() => window.location.reload()}
                    primary={'Cập nhật thành công'}
                />
            }
            <div style={{
                textAlign: 'center',
                padding: '50px 20px'
            }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={avatar ? avatar : default_avatar} style={{ width: 200, height: 200, borderRadius: 100 }} />
                    <div style={{ backgroundColor: '#999999', border: '1px solid #ccc', width: 30, height: 30, borderRadius: 15, position: 'absolute', right: 18, bottom: 18 }}>
                        <CameraAltIcon style={{ marginTop: 3, color: 'white' }} onClick={() => inputAvatar.current.click()} />
                        <input style={{ display: 'none' }}
                            type="file" onChange={(e) => handleChangeAvatar(e)} accept=".png, .jpeg, .jpg" ref={inputAvatar} />
                    </div>
                </div>
                <div style={{ margin: 10 }}>
                    <TextField
                        value={phone}
                        style={{ width: '100%' }}
                        id="outlined-basic" label="Số điện thoại" variant="outlined"
                        onChange={(e) => setPhone(e.target.value)} disabled />
                </div>
                <div style={{ margin: 10 }}>
                    <TextField
                        value={name}
                        style={{ width: '100%' }}
                        id="outlined-basic" label="Họ và tên" variant="outlined"
                        onChange={(e) => setName(e.target.value)} />
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <MobileDatePicker label="Ngày sinh"
                        value={birthday}
                        onChange={(newValue) => setBirthday(newValue)}
                        sx={{ width: '94%' }} />
                </LocalizationProvider>
                {/* <div style={{ margin: 10, position: 'relative' }}>
                    <TextField defaultValue={pass} style={{ width: '100%' }} type={!isShowPass ? "password" : "text"}
                        id="outlined-basic" label="Mật khẩu" variant="outlined" onChange={(e) => setPass(e.target.value)} />
                    {!isShowPass ?
                        <VisibilityOffOutlined onClick={() => setIsShowPass(true)}
                            style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />
                        : <VisibilityOutlinedIcon onClick={() => setIsShowPass(false)}
                            style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />}
                </div>
                <div style={{ margin: 10, position: 'relative' }}>
                    <TextField defaultValue={confirmPass} style={{ width: '100%' }} type={!isShowConfirmPass ? "password" : "text"}
                        id="outlined-basic" label="Xác nhận mật khẩu" variant="outlined" onChange={(e) => setConfirmPass(e.target.value)} />
                    {!isShowConfirmPass ?
                        <VisibilityOffOutlined onClick={() => setIsShowConfirmPass(true)}
                            style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />
                        : <VisibilityOutlinedIcon onClick={() => setIsShowConfirmPass(false)}
                            style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />}
                </div> */}
                <div style={{ fontSize: 15, color: 'red', textAlign: 'left', marginLeft: 10 }}>{error}</div>
                {
                    initUserData.current.username
                    && (initUserData.current.username !== name
                        || JSON.stringify(dayjs(new Date(getTimeUnixTimeStamp(initUserData.current.birthday)))) !== JSON.stringify(birthday)
                        || avatar != initUserData.current.avatar
                    )
                    && <div style={{ margin: 10 }}>
                        <Button onClick={() => handleSubmit()} style={{ width: '100%' }} variant="contained">
                            Cập nhật
                        </Button>
                    </div>
                }
            </div>
        </>
    );
};

export default Profile;
