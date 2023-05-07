import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Button, Grid } from '@mui/material';
const ConfirmModal = ({ primary, secondary, onAccept, onReject, isShowAccept = true, isShowReject = true }) => {
  const [open, setOpen] = useState(true);
  const handleOnAccept = () => {
    if (onAccept) onAccept();
    setOpen(false);
  }
  const handleOnReject = () => {
    if (onReject) onReject();
    setOpen(false);
  }
  return (
    <div>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Grid item>
              <div style={{ fontSize: 20, fontWeight: 'bold',textAlign: 'center' }}>{primary.toUpperCase()}</div>
              <div style={{ marginBottom: 20, marginTop: 10,textAlign: 'center' }}>{secondary}</div>
              <div style={{ textAlign: 'center' }}>
                {isShowAccept && <Button style={{ width: 150, fontSize: 15 }} onClick={() => handleOnAccept()}
                  variant="text">OK</Button>}
                {isShowReject && <Button style={{ width: 150, fontSize: 15 }} onClick={() => handleOnReject()}
                  color='error' variant="text">CANCEL</Button>
                }
              </div>
            </Grid>
          </Grid>
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
  width: '70%',
  bgcolor: 'background.paper',
  border: '2px solid #ccc',
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};
export default ConfirmModal;
