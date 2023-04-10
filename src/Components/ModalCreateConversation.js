import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Button, Grid } from '@mui/material';
const ModalCreateConversation = ({ socket, closeModal }) => {
  const { user } = useSelector(
    (state) => state.auth
  );
  const [name, setName] = useState('');
  const handleCreateNewConversation = () => {
    socket && socket.emit('create_conversation', {
      userId: user.id,
      conversationName: name,
      token: user.token
    });
    closeModal();
  }
  return (
    <div>
      <Modal
        open={true}
        onClose={() => closeModal()}
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
              <TextField sx={{mb: 1}}
               id="outlined-basic" label="Số điện thoại" variant="outlined" onChange={(e) => setName(e.target.value)} />
              <div>
                <Button sx={{width: '100%'}}
                onClick={() => handleCreateNewConversation()}
                  variant="contained">Gửi</Button>
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
  width: '80%',
  bgcolor: 'background.paper',
  border: '2px solid #ccc',
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
};
export default ModalCreateConversation;
