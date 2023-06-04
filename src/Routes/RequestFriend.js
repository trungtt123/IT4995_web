import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import SearchBar from "../Components/SearchBar";
import userService from "../Services/Api/userService";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar'; import { Button } from "@mui/material";
import HeaderScreen from "../Components/HeaderScreen";

const RequestFriend = ({ socket }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(
        (state) => state.auth
    );
    const [friends, setFriends] = useState([]);
    const [total, setTotal] = useState(0);
    const handleAcceptFriend = (userId, isAccept) => {
        userService.setAcceptFriend(userId, isAccept).then((result) => {
            console.log(result);
        }).catch((e) => {
            console.log(e);
        }).finally(() => {
            getListRequestFriend();
        })
    }
    const getListRequestFriend = () => {
        userService.getListFriendRequest(0, 0).then((result) => {
            setFriends(result.data.request);
            setTotal(result.data.total);
        }).catch((e) => {
            setFriends([]);
            console.log(e);
        })
    }
    const goToFriendProfile = () => {

    }
    useEffect(() => {
        getListRequestFriend();
    }, []);
    console.log(friends);
    return (
        <>
            <HeaderScreen title={"Lời mời kết bạn"} />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: `10px 5px 0px 10px` }}>
                <div>{`${total} lời mời kết bạn`}</div>
            </div>
            <div>
                <List sx={{ width: '100%' }}>
                    {
                        friends?.map((item, index) => {
                            let secondary = +item?.same_friends + " bạn chung";
                            return <ListItem style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
                                key={item.id} onClick={() => goToFriendProfile(item)}
                                sx={{ bgcolor: 'background.paper', m: 1, width: 'auto', borderRadius: 5, height: 80 }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <ListItemAvatar>
                                            <Avatar style={{ marginTop: 10 }} src={item?.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText primary={item.username} primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
                                            secondary={secondary} />
                                    </div>
                                    <div style={{ position: 'absolute', right: 15, top: `50%`, transform: `translateY(-50%)` }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Button style={{ fontSize: 10, marginBottom: 5 }} onClick={() => handleAcceptFriend(item?.id, 1)}
                                                variant="contained" size="small">{`Chấp nhận`}</Button>
                                            <Button style={{ fontSize: 10 }} onClick={() => handleAcceptFriend(item?.id, 0)}
                                                variant="contained" color="inherit" size="small">{`Hủy bỏ`}</Button>
                                        </div>
                                    </div>
                                </div>
                            </ListItem>
                        })
                    }
                </List>
            </div>
        </>
    );
};

export default RequestFriend;
