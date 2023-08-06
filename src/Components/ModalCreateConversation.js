import React, { useEffect, useRef, useState } from 'react';
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
  const [textNoti, setTextNoti] = useState('');
  const handleCreateNewConversation = () => {
    if (name?.length > 200) {
      setTextNoti('Tên cuộc hội thoại không được vượt quá 200 ký tự');
      return;
    }
    if (!navigator.onLine){
      setTextNoti('Có lỗi xảy ra');
      return;
    }
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
      >
        <Box sx={style}>
          <div style={{ width: '80%', margin: '0 auto' }}>
            <TextField sx={{ mb: 1, width: '100%' }}
              label="Tên cuộc hội thoại" variant="outlined" onChange={(e) => setName(e.target.value)} />
            <div style={{ color: 'red', fontSize: 14, width: 220 }}>{textNoti}</div>
            <div>
              <Button sx={{ width: '100%' }}
                onClick={() => handleCreateNewConversation()}
                variant="contained">Gửi</Button>
            </div>
          </div>
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
  padding: '',
  bgcolor: 'background.paper',
  border: '2px solid #ccc',
  borderRadius: 5,
  boxShadow: 24,
  p: 4,
  outline: 'none'
};
export default ModalCreateConversation;
