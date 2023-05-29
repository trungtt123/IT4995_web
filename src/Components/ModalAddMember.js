import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Button, Grid } from '@mui/material';
import userService from '../Services/Api/userService';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
const ModalAddMember = ({ socket, conversationId, closeModal }) => {
  const { user } = useSelector(
    (state) => state.auth
  );
  const inputText = useRef();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [friends, setFriends] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const getListFriend = () => {
    userService.getUserFriends(user.id, 0, 0).then((result) => {
      setFriends(result.data.friends);
    }).catch((e) => {
      console.log(e);
      setFriends([]);
    })
  }
  const handleAddMember = () => {
    socket && socket.emit('add_member',
      {
        conversationId: conversationId,
        phoneNumber: phoneNumber,
        token: user.token
      }
    )
    closeModal();
  }
  const handleChangeText = (value) => {
    console.log(friends);
    let dataTmp = [];
    if (value)
    dataTmp = friends?.filter(o => o.username.toUpperCase().includes(value.toUpperCase()) || o.phoneNumber.toUpperCase().includes(value.toUpperCase()));
    setFilterData(dataTmp);
    setPhoneNumber(value);
  }
  const handleSelectUser = (phoneNumber) => {
    console.log('phoneNumber', phoneNumber);
    setPhoneNumber(phoneNumber);
    setFilterData([]);
  }
  useEffect(() => {
    getListFriend();
  }, [])
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
              <TextField sx={{ mb: 1 }} value={phoneNumber}
                label="Người dùng" variant="outlined" onChange={(e) => handleChangeText(e.target.value)} />
              <div style={{marginBottom: 5}}>
                {filterData?.map((item, index) => {
                  return <div key={item.id} style={{ display: 'flex', flexDirection: 'row' }} onClick={(e) => handleSelectUser(item?.phoneNumber)}>
                    <Avatar style={{ marginRight: 10 }} src={item?.avatar} />
                    <ListItemText primary={item?.username} primaryTypographyProps={{ style: { fontWeight: 'bold', marginTop: 2 } }}
                    />
                  </div>
                })}
              </div>
              <div>
                <Button sx={{ width: '100%' }}
                  onClick={() => handleAddMember(true)}
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
export default ModalAddMember;
