import React, { useState, useEffect, useRef } from "react";
import { _getCache, _setCache, getTimeCreateConversation, getRandomColor, removeAccents } from "../Services/Helper/common";
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
import { TEXT_COMMON } from "../Services/Helper/constant";
import ConfirmModal from "../Components/ConfirmModal";
import { PullDownContent, ReleaseContent, RefreshContent, PullToRefresh } from "react-js-pull-to-refresh";

export default function Conversations({ socket }) {
    const dispatch = useDispatch();
    const history = useHistory();
    const [conversations, setConversations] = useState([]);
    const [showModalCreateConversation, setShowModalCreateConversation] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [keyword, setKeyword] = useState('');
    const textNoti = useRef('');
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
    const simplePromiseFunction = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const randomNumber = Math.random();
                resolve(randomNumber);
            }, 2000); // Giả lập một khoảng thời gian 2 giây
        });
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
                    setConversations(result.data);
                }
            }
        });
        // Lắng nghe sự kiện create_conversation
        socket.on('create_conversation', (result) => {
            console.log('result', result);
            if (isMounted) { // Kiểm tra component còn tồn tại trước khi cập nhật state
                if (result.code === '1000') {
                    textNoti.current = TEXT_COMMON.CREATE_NEW_CONVERSATION_SUCCESSFUL_LOWERCASE;
                    setIsShowModal(true);
                }
                else {
                    textNoti.current = TEXT_COMMON.CREATE_NEW_CONVERSATION_FAIL_LOWERCASE;
                    setIsShowModal(true);
                }
            }
        });

        return () => {
            isMounted = false; // Đánh dấu component đã unmount
            socket.off('conversation_change'); // Huỷ đăng ký sự kiện conversation_change
            socket.off('create_conversation'); // Huỷ đăng ký sự kiện create_conversation
        };
    }, [socket, user.id, user.token]);

    return (
        <>
            {
                isShowModal && <ConfirmModal
                    isShowReject={false}
                    onAccept={() => setIsShowModal(false)}
                    primary={textNoti.current}
                />
            }
            {showModalCreateConversation
                && <ModalCreateConversation socket={socket}
                    closeModal={() => setShowModalCreateConversation(false)} />}
            <div style={{ textAlign: 'center' }}>
                <Button style={{ position: 'fixed', bottom: 80, right: 10, width: 60, height: 60, borderRadius: '50%', zIndex: 1000, fontSize: 11 }}
                    onClick={() => setShowModalCreateConversation(true)}
                    variant="contained">{TEXT_COMMON.CREATE_UPPERCASE}</Button>
            </div>
            <div style={{ marginTop: 0 }}>
                <SearchBar onSearch={(keyword) => handleSearch(keyword)} />
            </div>
            {/* <PullToRefresh
                pullDownContent={<div style={{zIndex: 9999}}><PullDownContent height={100}/></div>}
                // releaseContent={<div>123</div>}
                refreshContent={<div style={{zIndex: 9999}}><RefreshContent /></div>}
                pullDownThreshold={100}
                onRefresh={() => simplePromiseFunction()}
                triggerHeight={20}
                startInvisible={true}
            > */}
                <div>
                    <List sx={{ width: '100%' }}>
                        {conversations?.filter((o) => removeAccents(o.conversationName.toUpperCase()).includes(removeAccents(keyword.toUpperCase())))?.map((item, index) => {
                            let secondary = '';
                            let userTmp = item.participants.find(o => o.user == user.id);
                            let chuaXem = (item?.messages?.length - 1) - userTmp.lastSeen.index;
                            let lastMessage = item?.messages[item?.messages.length - 1];
                            if (lastMessage?.type === 'text' || lastMessage?.type === 'notification')
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
                                <ListItemText primary={item.conversationName} primaryTypographyProps={{
                                    style: {
                                        fontWeight: 'bold', width: 200, textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap', overflow: 'hidden'
                                    }
                                }}
                                    secondary={secondary} secondaryTypographyProps={{
                                        style: {
                                            width: 200, textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', overflow: 'hidden'
                                        }
                                    }} />
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
                </div>
            {/* </PullToRefresh> */}
        </>)
}
