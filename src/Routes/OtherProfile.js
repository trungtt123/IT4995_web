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
import { useLocation } from "react-router-dom";
import HeaderScreen from "../Components/HeaderScreen";
const OtherProfile = () => {
    const location = useLocation();
    const [userData, setUserData] = useState();
    console.log('location', location);
    const userId = location?.state?.userId;
    useEffect(() => {
        if (userId) userService.getUserInfor(userId).then((result) => {
            console.log('getUserInfor', result.data);
            setUserData(result.data);
        }).catch(e => {
            console.log(e);
        })
    }, [userId]);
    return (
        <>
            <HeaderScreen title={userData?.username}/>
            <div style={{
                textAlign: 'center',
                padding: '50px 20px'
            }}>
                <img src={userData?.avatar ? userData?.avatar : default_avatar} style={{ width: 200, height: 200, borderRadius: 100, marginTop: 20 }}/>
                <div style={{marginTop: 10}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <b>Họ tên:</b> <span style={{marginLeft: 10}}>{userData?.username}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <b>Ngày sinh:</b> <span style={{marginLeft: 10}}>{getTimeUnixTimeStamp(userData?.birthday)}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <b>Số điện thoại:</b> <span style={{marginLeft: 10}}>{userData?.phoneNumber}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OtherProfile;
