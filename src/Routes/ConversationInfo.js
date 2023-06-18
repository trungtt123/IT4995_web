import React, { useEffect, useRef, useState, memo } from "react";
import default_avatar from '../Assets/images/default_avatar.jpg'
import { useHistory, useLocation } from "react-router-dom";
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import HeaderScreen from "../Components/HeaderScreen";
import { getRandomColor } from "../Services/Helper/common";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useSelector } from "react-redux";
import { Button } from "@mui/material";
const ConversationInfo = memo(({ socket, conversation }) => {
    const history = useHistory();
    const { user } = useSelector(
        (state) => state.auth
    );
    const owner = useRef();
    owner.current = (conversation?.participants?.find(o => o.permissions === 'owner'))?.user;
    const goToFriendProfile = (userId) => {
        console.log('userId', userId);
        history.push({ pathname: '/otherProfile', state: { userId: userId } });
    }
    useEffect(() => {
        console.log('conversation', conversation);
        if (!conversation) history.push('/');
    }, [conversation])
    console.log('user', user);
    return (
        <>
            <HeaderScreen title={"Thông tin cuộc hội thoại"} />
            <div style={{ marginTop: 60, padding: '0 10px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Avatar style={{
                        backgroundColor: getRandomColor(), margin: '0 auto', width: 100,
                        height: 100, fontSize: 40
                    }}>
                        {conversation?.conversationName && conversation?.conversationName[0]}
                    </Avatar>
                    <div style={{ marginBottom: 10 }}>{conversation?.conversationName}</div>
                </div>

                {conversation?.participants?.map((item, index) => {
                    let secondary = item?.permissions === "owner" ? 'Quản trị viên' : 'Thành viên';
                    return <div key={index} style={{ position: 'relative', boxShadow: '2px 2px 4px rgba(0,0,0,0.1)', backgroundColor: 'white', borderRadius: 20, height: 60, display: 'flex', alignItems: 'center', marginBottom: 5 }}
                        onClick={() => goToFriendProfile(item?.user?._id)}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <ListItemAvatar>
                                <Avatar style={{ marginTop: 10, marginLeft: 10 }} src={item?.user?.avatar?.url} />
                            </ListItemAvatar>
                            <ListItemText primary={item?.user?.name} primaryTypographyProps={{ fontWeight: 'bold' }}
                                secondary={secondary} />
                        </div>
                        {
                            owner.current._id === user.id && item?.permissions !== "owner"
                            && <div style={{ position: 'absolute', right: 15, top: `50%`, transform: `translateY(-50%)` }}>
                                <Button style={{ fontSize: 10, marginBottom: 5 }} onClick={() => { }}
                                    variant="contained" size="small">{`Loại bỏ`}</Button>
                            </div>
                        }
                    </div>
                })}
            </div>
        </>
    );
})

export default ConversationInfo;