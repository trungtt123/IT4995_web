import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Redux/authSlice";
const Login = (props) => {
    const dispatch = useDispatch();
    const [phone, setPhone] = useState();
    const [pass, setPass] = useState();

    const handleSubmit = () => {
        dispatch(login({phonenumber: phone, password: pass}))
    }
    return (
        <div style={{
            textAlign: 'center'
        }}>
            <div style={{marginBottom: 5}}>
                <label>Phone </label>
                <input type="text" defaultValue={phone}
                onChange={(e) => setPhone(e.target.value)} style={{ height: 40, fontSize: 20 }} />
            </div>
            <div style={{marginBottom: 5}}>
                <label>Pass </label>
                <input defaultValue={pass} onChange={(e) => setPass(e.target.value)}
                type="password" style={{ height: 40, fontSize: 20 }} />
            </div>
            <button onClick={() => handleSubmit()}
            style={{width: 100, height: 40}}>Gửi</button>
        </div>
    );
};

export default Login;
