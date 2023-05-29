import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import SearchBar from "../Components/SearchBar";
import userService from "../Services/Api/userService";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { Button } from "@mui/material";
import ModalAddFriend from "../Components/ModalAddFriend";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const Friend = ({ socket }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(
        (state) => state.auth
    );
    const history = useHistory();
    const [friends, setFriends] = useState([]);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [isShowModalAddFriend, setIsShowModalAddFriend] = useState(false);
    const getListFriend = () => {
        userService.getUserFriends(user.id, 0, 0).then((result) => {
            setFriends(result.data.friends);
            setTotal(result.data.total);
        }).catch((e) => {
            console.log(e);
        })
    }
    const goToFriendProfile = (userId) => {
        console.log('userId', userId);
        history.push({ pathname: '/otherProfile', state: { userId: userId } });
    }
    useEffect(() => {
        getListFriend();
    }, []);
    console.log(friends);
    return (
        <>
            {
                isShowModalAddFriend
                && <ModalAddFriend closeModal={() => setIsShowModalAddFriend(false)} />
            }
            <div style={{ marginTop: 0 }}>
                <SearchBar onSearch={(keyword) => setKeyword(keyword)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: `10px 5px 0px 10px` }}>
                <div>{`${total} bạn bè`}</div>
                <div>
                    <Button style={{ fontSize: 15 }} onClick={() => history.push('/requestFriend')}
                        size="small">{`Lời mời kết bạn`}</Button>
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <Button style={{ position: 'fixed', bottom: 80, right: 10, width: 60, height: 60, borderRadius: '50%', zIndex: 1000, fontSize: 11 }}
                    onClick={() => setIsShowModalAddFriend(true)}
                    variant="contained">Thêm bạn</Button>
            </div>
            <div style={{ margin: '0 10px' }}>
                <Grid container spacing={2} >
                    {
                        friends?.filter((o) => o.username.includes(keyword))?.map((item, index) => {
                            let secondary = +item?.same_friends + " bạn chung";
                            return <Grid item xs={6} key={item.id}>
                                <div style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.1)', backgroundColor: 'white', borderRadius: 10, height: 80, display: 'flex', alignItems: 'center' }}
                                    onClick={() => goToFriendProfile(item.id)}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <ListItemAvatar>
                                                <Avatar style={{ marginTop: 10, marginLeft: 10 }} src={item?.avatar} />
                                            </ListItemAvatar>
                                            <ListItemText primary={item.username} primaryTypographyProps={{
                                                style: {
                                                    fontWeight: 'bold', width: '90%',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden'
                                                }
                                            }}
                                                secondary={secondary} />
                                        </div>
                                    </div>
                                </div>
                            </Grid>
                        })
                    }
                </Grid>
            </div>
        </>
    );
};

export default Friend;
