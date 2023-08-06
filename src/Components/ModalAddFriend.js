import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Button, Grid } from '@mui/material';
import userService from '../Services/Api/userService';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { delay } from '../Services/Helper/common';
const ModalAddFriend = ({ socket, closeModal }) => {
  const { user } = useSelector(
    (state) => state.auth
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchUser, setSearchUser] = useState();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleSearchUser = () => {
    userService.getUserFromPhoneNumber(phoneNumber).then((result) => {
      console.log(result.data);
      setSearchUser(result.data);
    }).catch((e) => {
      setSearchUser(undefined);
      setError('Không tìm thấy người dùng');
      console.log(e);
    })
    //closeModal();
  }
  const handleChangePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
    setSearchUser(undefined);
    setError('');
    setSuccess('');
  }
  const handleSendRequestFriend = () => {
    userService.setRequestFriend(searchUser?.id).then(async (result) => {
      setSuccess('Gửi lời mời thành công');
      await delay(2000);
      closeModal();
    }).catch((e) => {
      console.error(e);
    })
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
              <TextField sx={{ mb: 1 }}
                label="Số điện thoại" variant="outlined" onChange={(e) => handleChangePhoneNumber(e)} />
              {
                searchUser && <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Avatar style={{ marginRight: 10 }} src={searchUser?.avatar} />
                  <ListItemText primary={searchUser?.username} primaryTypographyProps={{ style: { fontWeight: 'bold', marginTop: -7 } }}
                    secondary={searchUser?.is_myself === "true" ? 'Bạn' : searchUser?.is_friend === "true" ? 'Các bạn đã là bạn bè' : ''}
                  />
                </div>
              }
              <div style={{ color: 'red', fontSize: 14 }}>{error}</div>
              <div style={{ color: '#1976d2', fontSize: 14 }}>{success}</div>
              {
                searchUser && searchUser?.is_myself !== "true" && searchUser?.is_friend !== "true" && <div style={{ marginTop: 5 }}>
                  <Button sx={{ width: '100%' }}
                    onClick={() => handleSendRequestFriend()}
                    variant="contained">Kết bạn</Button>
                </div>
              }
              {
                !searchUser && <div>
                  <Button sx={{ width: '100%' }}
                    onClick={() => handleSearchUser()}
                    variant="contained">Tìm kiếm</Button>
                </div>
              }
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
  outline: 'none'
};
export default ModalAddFriend;
