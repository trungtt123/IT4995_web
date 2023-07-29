import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { TextField, Button, Grid } from '@mui/material';
const ModalDetailMedia = ({ url, type, closeModal }) => {
    console.log('url', url);
    console.log('type', type);
    return (
        <div>
            <Modal
                open={true}
                onClose={() => closeModal()}
            >
                <Box sx={style}>
                    {type === "image" && <img style={{ width: window.innerWidth * 0.8 }} src={url} />}
                </Box>
            </Modal>
        </div>

    );
};
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    outline: 'none'
};
export default ModalDetailMedia;
