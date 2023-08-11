import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Redux/authSlice";
import { OutlinedInput, TextField, Button } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import soict from '../Assets/images/soict.png'
import { useHistory } from "react-router-dom";
import { TEXT_COMMON } from "../Services/Helper/constant";
const Login = (props) => {
    const dispatch = useDispatch();
    const { loginType } = useSelector(
        (state) => state.auth
    );
    const history = useHistory();
    const [phone, setPhone] = useState();
    const [pass, setPass] = useState();
    const [isShowPass, setIsShowPass] = useState(false);
    const windowHeight = window.innerHeight; 
    const handleSubmit = () => {
        dispatch(login({ phonenumber: phone, password: pass }))
    }
    return (
        <div style={{
            textAlign: 'center',
            padding: '50px 20px'
        }}>
            <div style={{marginBottom: Math.max(50, windowHeight - 550)}}>
                <img src={soict} style={{ width: 200, height: 200, borderRadius: 100 }} />
                <div style={{ margin: 10 }}>
                    <TextField defaultValue={phone} style={{ width: '100%' }}
                        label={TEXT_COMMON.PHONE_NUMBER_LOWERCASE} variant="outlined" onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div style={{ margin: 10, position: 'relative' }}>
                    <TextField defaultValue={pass} style={{ width: '100%' }} type={!isShowPass ? "password" : "text"}
                        label={TEXT_COMMON.PASSWORD_LOWERCASE}variant="outlined" onChange={(e) => setPass(e.target.value)} />
                    {!isShowPass ?
                        <VisibilityOffOutlined onClick={() => setIsShowPass(true)}
                            style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />
                        : <VisibilityOutlinedIcon onClick={() => setIsShowPass(false)}
                            style={{ position: 'absolute', right: 15, top: 15 }} fontSize="small" />}
                </div>
                {loginType === 0 && <div style={{textAlign: 'left', fontSize: 14, color: 'red', marginLeft: '10px'}}>Thông tin đăng nhập không đúng</div>}
                <div style={{ fontSize: 14, float: 'right', margin: 10 }}>{TEXT_COMMON.FORGOT_PASSWORD_LOWERCASE}</div>
                <div style={{ margin: 10 }}>
                    <Button onClick={() => handleSubmit()} style={{ width: '100%' }}
                        variant="contained">{TEXT_COMMON.LOG_IN_LOWERCASE}</Button>
                </div>
                
            </div>
            <div style={{
                // position: 'fixed', bottom: 0,
                // left: '50%',
                // transform: `translate(-50%, -50%)`
            }}>

                <Button style={{ fontSize: 15 }} onClick={() => history.push('/signup')}
                    variant="text">{TEXT_COMMON.CREATE_NEW_ACCOUNT_UPPERCASE}</Button>
            </div>
            
        </div>
    );
};

export default Login;
