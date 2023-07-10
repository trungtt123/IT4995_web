import React, { useState, useEffect } from "react";
import { _getCache, _setCache, getTimeCreateConversation, getRandomColor } from "../Services/Helper/common";
import { useDispatch, useSelector } from "react-redux";
import ModalCreateConversation from "../Components/ModalCreateConversation";
import Button from '@mui/material/Button';
import { useHistory } from "react-router-dom";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import SearchBar from "../Components/SearchBar";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CallIcon from '@mui/icons-material/Call';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Conversations({ socket }) {
    const dispatch = useDispatch();
    const history = useHistory();
    const [conversations, setConversations] = useState([]);
    const [showModalCreateConversation, setShowModalCreateConversation] = useState(false);
    const [keyword, setKeyword] = useState('');
    const { user } = useSelector(
        (state) => state.auth
    );
    const goToConversation = (conversation) => {
        history.push({
            pathname: `/conversation/${conversation._id}`,
            state: { conversation: conversation }
        });
    }
    const handleSearch = (keyword) => {
        setKeyword(keyword)
    }
    useEffect(() => {
        let isMounted = true; // Thêm biến isMounted để kiểm tra component có còn tồn tại hay không

        socket.emit('me', { userId: user.id });
        socket.emit('get_list_conversation', {
            userId: user.id,
            token: user.token
        });

        // Lắng nghe sự kiện conversation_change
        socket.on('conversation_change', (result) => {
            if (isMounted) { // Kiểm tra component còn tồn tại trước khi cập nhật state
                if (result.code === '1000') {
                    console.log('123');
                    setConversations(result.data);
                }
            }
        });

        return () => {
            isMounted = false; // Đánh dấu component đã unmount
            socket.off('conversation_change'); // Huỷ đăng ký sự kiện conversation_change
        };
    }, [socket, user.id, user.token]);

    return (
        <>
            {showModalCreateConversation
                && <ModalCreateConversation socket={socket}
                    closeModal={() => setShowModalCreateConversation(false)} />}
            <div style={{ textAlign: 'center' }}>
                <Button style={{ position: 'fixed', bottom: 80, right: 10, width: 60, height: 60, borderRadius: '50%', zIndex: 1000, fontSize: 11 }}
                    onClick={() => setShowModalCreateConversation(true)}
                    variant="contained">TẠO MỚI</Button>
            </div>
            <div style={{ marginTop: 0 }}>
                <SearchBar onSearch={(keyword) => handleSearch(keyword)} />
            </div>
            <List sx={{ width: '100%' }}>
                {conversations?.filter((o) => o.conversationName.includes(keyword))?.map((item, index) => {
                    let secondary = '';
                    let userTmp = item.participants.find(o => o.user == user.id);
                    let chuaXem = (item?.messages?.length - 1) - userTmp.lastSeen.index;
                    let lastMessage = item?.messages[item?.messages.length - 1];
                    if (lastMessage?.type === 'text')
                        secondary = lastMessage?.content?.body;
                    else if (lastMessage?.type === 'image') {
                        secondary = 'Hình ảnh';
                    }
                    else if (lastMessage?.type === 'video') {
                        secondary = 'Video';
                    }
                    if (!secondary) secondary = getTimeCreateConversation(item?.createdAt);
                    return <ListItem style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
                        key={item._id} onClick={() => goToConversation(item)}
                        sx={{ bgcolor: 'background.paper', m: 1, width: 'auto', borderRadius: 5, height: 80 }}
                    >
                        <ListItemAvatar>
                            {/* style={{ background: `linear-gradient(to bottom right, ${getRandomColor()}, ${getRandomColor()}, ${getRandomColor()}, #000)`, color: '#fff'}} */}
                            <Avatar style={{ backgroundColor: getRandomColor() }}>
                                {item.conversationName[0]}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={item.conversationName} primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
                            secondary={secondary} />
                        {chuaXem > 0 && <div style={{
                            marginRight: 10,
                            width: 12,
                            height: 12,
                            backgroundColor: 'red',
                            color: 'white',
                            borderRadius: '50%',
                            padding: 5,
                            position: 'relative'
                        }}>
                            {
                                chuaXem <= 9 ?
                                    <span style={{ position: 'absolute', left: 8, top: -5 }}>
                                        <span style={{ fontSize: 12, textAlign: 'center' }}>
                                            {chuaXem}
                                        </span>

                                    </span>
                                    : <span style={{ position: 'absolute', left: 5, top: -4.5 }}>
                                        <span style={{ fontSize: 12, textAlign: 'center' }}>
                                            {'9+'}
                                        </span>

                                    </span>
                            }
                        </div>}
                    </ListItem>
                })}

                {/* <div 
                        style={{ padding: 5, height: 100, border: 'solid 1px #ccc', margin: 5, borderRadius: 20 }}>
                        <div>{item.conversationName}</div>
                        <div>{item?.messages[item?.messages.length - 1]?.content}</div>
                    </div> */}
            </List>
        </>)
}
