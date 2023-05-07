import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Redux/authSlice";
import { OutlinedInput, TextField, Button } from "@mui/material";
import { VisibilityOffOutlined } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import soict from '../Assets/images/soict.png'
import { useHistory } from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import Conversations from "./Conversations";
import Profile from "./Profile";

const Home = ({ socket }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [tabIndex, setTabIndex] = useState(1);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };
    const tab1 = <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div><PhoneIcon style={{ fontSize: 17 }} /></div>
        <div style={{ fontSize: 11 }}>Cuộc gọi</div>
    </div>
    const tab2 = <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div><EmailIcon style={{ fontSize: 17 }} /></div>
        <div style={{ fontSize: 11 }}>Hội thoại</div>
    </div>
    const tab3 = <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div><PersonPinIcon style={{ fontSize: 17 }} /></div>
        <div style={{ fontSize: 11 }}>Cá nhân</div>
    </div>
    return (
        <>
            <div style={{ marginBottom: 60 }}>
                {tabIndex === 1 && <Conversations socket={socket} />}
                {tabIndex === 2 && <Profile />}
            </div>
            <div style={{ position: 'fixed', bottom: -1, width: '100%', height: 60 }}>
                <Tabs style={{ display: 'flex', width: '100%', backgroundColor: 'white' }}
                    value={tabIndex} onChange={handleChange}>
                    <Tab icon={tab1} aria-label="phone" style={{ flexGrow: 1 }} />
                    <Tab icon={tab2} aria-label="favorite" style={{ flexGrow: 1 }} />
                    <Tab icon={tab3} aria-label="person" style={{ flexGrow: 1 }} />
                </Tabs>
            </div>
        </>
    );
};

export default Home;
