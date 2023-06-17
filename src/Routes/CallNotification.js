import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { login } from "../Redux/authSlice";
import { OutlinedInput, TextField, Button } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import soict from '../Assets/images/soict.png'
import CallEndIcon from '@mui/icons-material/CallEnd';
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import { useHistory, useLocation } from "react-router-dom";
import Room from "./Room";
import { callAction } from "../Redux/callSlice";
const CallNotification = ({ roomCall, socket }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(
        (state) => state.auth
    );
    const history = useHistory();
    const location = useLocation();
    const { pathname, search } = location;
    const searchParams = new URLSearchParams(search);
    const senderId = searchParams.get('senderId');
    const conversationId = searchParams.get('conversationId');
    const conversationName = searchParams.get('conversationName');
    console.log(senderId, conversationId, conversationName);
    const handleCancelCall = () => {
        dispatch(callAction(false))
        history.goBack();
    }
    const handleAcceptCall = () => {
        dispatch(callAction(true))
        history.replace({pathname: `/conversation/${conversationId}`});
    }
    useEffect(() => {
    }, []);
    useEffect(() => {
        // Đăng ký sự kiện "endcall" khi component mount
        const endCallHandler = () => {
            console.log('run');
            history.goBack();
        };
        socket && socket.on('endcall', endCallHandler);

        // Cleanup function để gỡ bỏ sự kiện "endcall" khi component unmount
        return () => {
            socket && socket.off('endcall', endCallHandler);
        };
    }, [socket]);
    useEffect(() => {

    }, [])
    return (
        <>
            {
                (senderId !== user.id) && <div style={{ backgroundColor: 'black', height: '100vh', display: 'flex',
                justifyContent: 'end', flexDirection: 'column' }}>
                    <div style={{ textAlign: 'center', color: 'white', marginBottom: '50%' }}>{`${conversationName} đang gọi...`}</div>
                    <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'center', padding: '20%', justifyContent: 'space-between' }}>
                        <div onClick={(e) => handleCancelCall()} style={{
                            borderRadius: 20,
                            width: 40,
                            height: 40,
                            backgroundColor: 'red'
                        }}>
                            <CallEndIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
                        </div>
                        <div onClick={(e) => handleAcceptCall()} style={{
                            borderRadius: 20,
                            width: 40,
                            height: 40,
                            backgroundColor: '#33cc33'
                        }}>
                            <PhoneEnabledIcon style={{ fontSize: 25, color: 'white', marginTop: 7 }} />
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default CallNotification;
