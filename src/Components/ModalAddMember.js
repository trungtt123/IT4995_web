import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Button, Grid } from '@mui/material';
import userService from '../Services/Api/userService';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
const ModalAddMember = ({ socket, conversation, closeModal }) => {
  const { user } = useSelector(
    (state) => state.auth
  );
  const inputText = useRef();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [friends, setFriends] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [status, setStatus] = useState(0);
  const [statusDes, setStatusDes] = useState('');
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
        conversationId: conversation?._id,
        phoneNumber: phoneNumber,
        token: user.token
      }
    )
    // closeModal();
  }
  const handleChangeText = (value) => {
    setStatus(0);
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
    socket && socket.on('conversation_add_member', (result) => {
      console.log(result)
      if (result.code == "1000") {
        setStatus(1);
      }
      else if (result.code == "9999") {
        setStatus(2);
        let tmp;
        if (result.reason === 'USER NOT EXIST') tmp = 'Người dùng không tồn tại';
        else if (result.reason === 'USER ALREADY EXISTS IN CHAT') tmp = 'Người dùng này đã được thêm';
        setStatusDes(tmp);
      }
    })
  }, [socket])
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
              <div style={{ marginBottom: 5 }}>
                {filterData?.map((item, index) => {
                  return <div key={item.id} style={{ display: 'flex', flexDirection: 'row' }} onClick={(e) => handleSelectUser(item?.phoneNumber)}>
                    <Avatar style={{ marginRight: 10 }} src={item?.avatar} />
                    <ListItemText primary={item?.username} primaryTypographyProps={{ style: { fontWeight: 'bold', marginTop: 2 } }}
                    />
                  </div>
                })}
              </div>
              {status === 1 && <div style={{ color: '#1976d2', fontSize: 14 }}>Thêm thành công</div>}
              {status === 2 && <div style={{ color: 'red', fontSize: 14 }}>{statusDes}</div>}
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
