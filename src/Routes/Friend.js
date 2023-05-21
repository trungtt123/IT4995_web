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
;

const Friend = ({ socket }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(
        (state) => state.auth
    );
    const history = useHistory();
    const [friends, setFriends] = useState([]);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState('');
    const getListFriend = () => {
        userService.getUserFriends(user.id, 0, 0).then((result) => {
            setFriends(result.data.friends);
            setTotal(result.data.total);
        }).catch((e) => {
            console.log(e);
        })
    }
    const goToFriendProfile = () => {
        
    }
    useEffect(() => {
        getListFriend();
    }, []);
    console.log(friends);
    return (
        <>
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
                    // onClick={() => setShowModalCreateConversation(true)}
                    variant="contained">Thêm bạn</Button>
            </div>
            <div>
                <List sx={{ width: '100%' }}>
                    {
                        friends?.filter((o) => o.username.includes(keyword))?.map((item, index) => {
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
                                    {/* <div style={{ position: 'absolute', right: 15, top: `50%`,transform: `translateY(-50%)` }}>
                                        <Button style={{ fontSize: 10 }} onClick={() => history.push('/signup')}
                                            variant="contained" size="small">{`Xem chi tiết`}</Button>
                                    </div> */}
                                </div>
                            </ListItem>
                        })
                    }
                </List>
            </div>
        </>
    );
};

export default Friend;
