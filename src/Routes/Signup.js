import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Redux/authSlice";
import { OutlinedInput, TextField, Button } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import soict from '../Assets/images/soict.png'
import { useHistory } from "react-router-dom";
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from "axios";
import { REST_API_URL } from "../Services/Helper/constant";
import ConfirmModal from "../Components/ConfirmModal";
const Signup = (props) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [name, setName] = useState();
    const [phone, setPhone] = useState();
    const [pass, setPass] = useState();
    const [birthday, setBirthday] = useState();
    const [confirmPass, setConfirmPass] = useState();
    const [isShowPass, setIsShowPass] = useState(false);
    const [isShowConfirmPass, setIsShowConfirmPass] = useState(false);
    const [error, setError] = useState();
    const [isShowModal, setIsShowModal] = useState(false);
    const windowHeight = window.innerHeight;
    const handleSubmit = () => {

        if (!name) {
            setError('Hãy nhập họ và tên');
            return;
        }
        if (!phone) {
            setError('Hãy nhập số điện thoại');
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
        axios.post(`${REST_API_URL}/auth/signup?phonenumber=${phone}&name=${name}&password=${pass}&birthday=${dateString}`).then((result) => {
            setIsShowModal(true);
        }).catch(e => {
            console.log(e);
            if (e.response.data.message === 'User existed') {
                setError('Số điện thoại này đã được đăng ký')
            }
        });
    }
    return (
        <>
            {isShowModal && <ConfirmModal
                onAccept={() => history.push('/login')}
                onReject={() => window.location.reload()}
                primary={'Đăng ký thành công'}
                secondary={'Đăng nhập để tiếp tục'} />}
            <div style={{
                textAlign: 'center',
                padding: '50px 20px'
            }}>
                <div style={{marginBottom: Math.max(50, windowHeight - 700)}}>
                    <img src={soict} style={{ width: 200, height: 200, borderRadius: 100 }} />
                    <div style={{ margin: 10 }}>
                        <TextField defaultValue={name} style={{ width: '100%' }}
                            id="outlined-basic" label="Họ và tên" variant="outlined" onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div style={{ margin: 10 }}>
                        <TextField defaultValue={phone} style={{ width: '100%' }}
                            id="outlined-basic" label="Số điện thoại" variant="outlined" onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                        <MobileDatePicker label="Ngày sinh"
                            value={birthday}
                            onChange={(newValue) => setBirthday(newValue)}
                            defaultValue={dayjs(new Date())} sx={{ width: '94%' }} />
                    </LocalizationProvider>
                    <div style={{ margin: 10, position: 'relative' }}>
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
                    </div>
                    <div style={{ fontSize: 15, color: 'red', textAlign: 'left', marginLeft: 10 }}>{error}</div>
                    <div style={{ margin: 10 }}>
                        <Button onClick={() => handleSubmit()} style={{ width: '100%' }}
                            variant="contained">Đăng ký</Button>
                    </div>
                </div>
                <div style={{
                    // position: 'fixed', bottom: 0,
                    // left: '50%',
                    // transform: `translate(-50%, -50%)`
                }}>
                    <Button style={{ fontSize: 15 }} onClick={() => history.push('/login')}
                        variant="text">{`ĐĂNG NHẬP`}</Button>
                </div>
            </div>
        </>
    );
};

export default Signup;
