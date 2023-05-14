import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useHistory } from 'react-router-dom';
const HeaderScreen = ({ title = "" }) => {
    const history = useHistory();
    return (
        <div style={{
            height: 50, width: '100%', position: 'fixed', backgroundColor: 'white', zIndex: 10, top: -2,
            display: 'flex',
            justifyContent: 'space-between',
            boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
            <div style={{
                marginTop: 13, marginLeft: 10,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', width: '50%',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <ArrowBackIcon style={{ marginRight: 10 }}
                    onClick={() => history.goBack()} />

                <span style={{ position: 'absolute', top: -2 }}>{title}</span>
            </div>
        </div>

    );
};

export default HeaderScreen;
