import React, { useEffect, useState } from "react";
import { useDispatch, useSelector,  } from "react-redux";
import { login } from "../Redux/authSlice";
import { OutlinedInput, TextField, Button } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import soict from '../Assets/images/soict.png'
import { useHistory,useLocation } from "react-router-dom";
import Room from "./Room";
const CallNotification = ({ roomCall, socket }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(
        (state) => state.auth
    );
    const history = useHistory();
    const location = useLocation();
    const [isCall, setIsCall] = useState(false);
    const { pathname, search } = location;
    const searchParams = new URLSearchParams(search);
    const senderId = searchParams.get('senderId');
    const converationId = searchParams.get('converationId');
    const converationName = searchParams.get('converationName');
    console.log(senderId, converationId, converationName);
    const handleCancelCall = () => {
        history.goBack();
    }
    const handleAcceptCall = () => {
        setIsCall(true);
    }
    const handleEndCall = () => {
        setIsCall(false);
        history.goBack();
    }
    useEffect(() => {
        if (senderId === user.id){
            setIsCall(true);
        }
    }, []) 
    return (
        <>
            {isCall && <Room roomId={converationId} handleEndCall={() => handleEndCall()}/>}
            <div style={{ backgroundColor: 'black', height: '100vh' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>{`${converationName} đang gọi...`}</div>                
                <div style={{ textAlign: 'center' }}>
                    <button onClick={() => handleCancelCall()}>Cancel</button>
                    <button onClick={() => handleAcceptCall()}>Accept</button>
                </div>
            </div>
        </>
    );
};

export default CallNotification;
