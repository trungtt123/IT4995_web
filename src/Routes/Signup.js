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
import { REST_API_URL, TEXT_COMMON } from "../Services/Helper/constant";
import ConfirmModal from "../Components/ConfirmModal";
import authService from "../Services/Api/authService";
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
    const [error, setError] = useState('');
    const [isShowModal, setIsShowModal] = useState(false);
    const windowHeight = window.innerHeight;
    const handleSubmit = () => {
        try {
            if (!name) {
                setError(TEXT_COMMON.PLEASE_ENTER_FULL_NAME_LOWERCASE);
                return;
            }
            if (!phone) {
                setError(TEXT_COMMON.PLEASE_ENTER_PHONE_NUMBER_LOWERCASE);
                return;
            }
            if (pass !== confirmPass) {
                setError(TEXT_COMMON.PASSWORD_CONFIRMATION_DOES_NOT_MATCH_LOWERCASE);
                return;
            }
            if (!birthday) {
                setError(TEXT_COMMON.PLEASE_SELECT_YOUR_BIRTHDAY_LOWERCASE);
                return;
            }
            const dateString = birthday.$y + "-" + (birthday.$M + 1) + "-" + birthday.$D;
            authService.signup(phone?.trim(), pass?.trim(), name?.trim(), dateString?.trim()).then((result) => {
                setIsShowModal(true);
            }).catch(e => {
                console.log(e);
                if (e.response.data.message === 'User existed') {
                    setError(TEXT_COMMON.THIS_PHONE_NUMBER_IS_ALREADY_REGISTERED_LOWERCASE)
                } 
                else if (e.response.data.code === "1004" && (e.response.data.details === "password" || e.response.data.details === "trùng phone và pass")) {
                    setError(TEXT_COMMON.INVALID_PASSWORD_PLEASE_ENTER_A_PASSWORD_OF_AT_LEAST_6_CHARACTERS_AND_NOT_THE_SAME_AS_THE_PHONE_NUMBER);
                }
            });
        }
        catch(e){

        }
        
    }
    return (
        <>
            {isShowModal && <ConfirmModal
                isShowReject={false}
                onAccept={() => history.push('/login')}
                onReject={() => window.location.reload()}
                primary={TEXT_COMMON.REGISTRATION_SUCCESSFUL}
                secondary={TEXT_COMMON.LOG_IN_TO_CONTINUE} />}
            <div style={{
                textAlign: 'center',
                padding: '50px 20px'
            }}>
                <div style={{marginBottom: Math.max(50, windowHeight - 700)}}>
                    <img src={soict} style={{ width: 200, height: 200, borderRadius: 100 }} />
                    <div style={{ margin: 10 }}>
                        <TextField defaultValue={name} style={{ width: '100%' }}
                            label={TEXT_COMMON.FULL_NAME_LOWERCASE} variant="outlined" onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div style={{ margin: 10 }}>
                        <TextField defaultValue={phone} style={{ width: '100%' }}
                            label={TEXT_COMMON.PHONE_NUMBER_LOWERCASE} variant="outlined" onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                        <MobileDatePicker label={TEXT_COMMON.BIRTHDAY_LOWERCASE}
                            value={birthday}
                            onChange={(newValue) => setBirthday(newValue)}
                            sx={{ width: '94%' }} />
                    </LocalizationProvider>
                    <div style={{ margin: 10, position: 'relative' }}>
                        <TextField defaultValue={pass} style={{ width: '100%' }} type={!isShowPass ? "password" : "text"}
                            label={TEXT_COMMON.PASSWORD_LOWERCASE} variant="outlined" onChange={(e) => setPass(e.target.value)} />
                        {!isShowPass ?
                            <VisibilityOffOutlined onClick={() => setIsShowPass(true)}
                                style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />
                            : <VisibilityOutlinedIcon onClick={() => setIsShowPass(false)}
                                style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />}
                    </div>
                    <div style={{ margin: 10, position: 'relative' }}>
                        <TextField defaultValue={confirmPass} style={{ width: '100%' }} type={!isShowConfirmPass ? "password" : "text"}
                            label={TEXT_COMMON.CONFIRM_PASSWORD_LOWERCASE} variant="outlined" onChange={(e) => setConfirmPass(e.target.value)} />
                        {!isShowConfirmPass ?
                            <VisibilityOffOutlined onClick={() => setIsShowConfirmPass(true)}
                                style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />
                            : <VisibilityOutlinedIcon onClick={() => setIsShowConfirmPass(false)}
                                style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />}
                    </div>
                    <div style={{ fontSize: 15, color: 'red', textAlign: 'left', marginLeft: 10 }}>{error}</div>
                    <div style={{ margin: 10 }}>
                        <Button onClick={() => handleSubmit()} style={{ width: '100%' }}
                            variant="contained">{TEXT_COMMON.SIGN_UP_LOWERCASE}</Button>
                    </div>
                </div>
                <div style={{
                    // position: 'fixed', bottom: 0,
                    // left: '50%',
                    // transform: `translate(-50%, -50%)`
                }}>
                    <Button style={{ fontSize: 15 }} onClick={() => history.push('/login')}
                        variant="text">{TEXT_COMMON.LOG_IN_UPPERCASE}</Button>
                </div>
            </div>
        </>
    );
};

export default Signup;
