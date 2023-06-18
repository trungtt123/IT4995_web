import React, { useState, useEffect } from "react";
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
import Diversity3Icon from '@mui/icons-material/Diversity3';
import EmailIcon from '@mui/icons-material/Email';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import Conversations from "./Conversations";
import Profile from "./Profile";
import Friend from "./Friend";

const Home = ({ socket }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [tabIndex, setTabIndex] = useState();

    const handleChange = (event, newValue) => {
        localStorage.setItem('tabIndex', newValue);
        setTabIndex(newValue);
    };
    const tab1 = <div style={{ display: 'flex', flexDirection: 'column', width: 60 }}>
        <div><Diversity3Icon style={{ fontSize: 17 }} /></div>
        <div style={{ fontSize: 11 }}>Bạn bè</div>
    </div>
    const tab2 = <div style={{ display: 'flex', flexDirection: 'column', width: 60 }}>
        <div><EmailIcon style={{ fontSize: 17 }} /></div>
        <div style={{ fontSize: 11 }}>Hội thoại</div>
    </div>
    const tab3 = <div style={{ display: 'flex', flexDirection: 'column', width: 60 }}>
        <div><PersonPinIcon style={{ fontSize: 17 }} /></div>
        <div style={{ fontSize: 11 }}>Cá nhân</div>
    </div>
    useEffect(() => {
        const switchTab = () => {
            try {
                let tabIndexTmp = parseInt(localStorage.getItem('tabIndex'), 10);
                if (isNaN(tabIndexTmp)) {
                    setTabIndex(1);
                }
                else setTabIndex(tabIndexTmp);
            }
            catch (e) {
                setTabIndex(1);
            }
        }
        switchTab();
        return () => {
            switchTab()
        }
    }, [])
    console.log('tabIndex', tabIndex);
    return (
        <>
            {
                tabIndex !== undefined &&
                <>
                    <div style={{ marginBottom: 60 }}>
                        {tabIndex === 0 && <Friend />}
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
            }
        </>
    );
};

export default Home;
