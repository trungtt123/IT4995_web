import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTextWithIcon } from "../Services/Helper/common";
import default_avatar from '../Assets/images/default_avatar.jpg'
import { useHistory, useLocation } from "react-router-dom";
import OutlinedInput from '@mui/material/OutlinedInput';
import { Button } from "@mui/material";
import ModalAddMember from "../Components/ModalAddMember";
function MessageItem(props) {
    if (props.idSender != props.idUser)
        return (
            <div style={{ height: 60, position: 'relative' }}>
                <span>{props?.avatar?.url
                    ? <img src={props?.avatar?.url} style={{ width: 30, height: 30, borderRadius: 15 }} />
                    : <img src={default_avatar} style={{ width: 30, height: 30, borderRadius: 15 }} />}
                </span>
                <span style={{
                    backgroundColor: '#ccc',
                    height: 40,
                    borderRadius: 10,
                    color: 'black',
                    padding: 5,
                    position: 'absolute',
                    top: -20,
                    marginLeft: 5
                }}>
                    {props.mess}
                </span>
            </div>
        );
    else
        return (
            <div style={{ height: 60, position: 'relative' }}>
                <span style={{
                    float: 'right',
                    backgroundColor: '#5540ff',
                    height: 40,
                    borderRadius: 10,
                    color: 'white',
                    padding: 5,
                    position: 'absolute',
                    top: -20,
                    right: 0
                }}>
                    {props.mess}
                </span>
            </div>
        );
}

export default function Conversation({ socket }) {
    const location = useLocation();
    const history = useHistory();
    const { user } = useSelector(
        (state) => state.auth
    );
    const [listMessage, setListMessage] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [listMember, setListMember] = useState([]);
    const [avatar, setAvatar] = useState({});
    const conversation = location.state?.conversation;
    //tin nhắn muốn gửi
    const [textMessage, setTextMessage] = useState("");
    const [lastSeenMessage, setLastSeenMessage] = useState();
    const mess = useRef();
    const messageEndRef = useRef(null);

    const handleSendMessage = (mess) => {
        socket && socket.emit('new_message', {
            token: user.token,
            userId: user.id,
            conversationId: conversation._id,
            content: textMessage
        });
        setTextMessage('');
    }
    const handleBack = () => {
        // socket?.emit('client_leave_conversation', {
        //   token: user.token,
        //   thisUserId: user.id,
        //   targetUserId: userId
        // })
        // navigation.goBack();
    }
    const handleCall = () => {
        history.push({
            pathname: '/room',
            state: { roomId: conversation._id }
        });
    }

    const scrollToBottom = () => {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        conversation && socket && socket.emit('join_conversation', {
            conversationId: conversation._id,
            token: user.token
        })
        socket && socket.on('new_message', (result) => {
            setListMember(result.data.participants);
            const memTmp = result.data.participants;
            // xử lý avatar
            let avt = avatar;
            for (let i = 0; i < memTmp.length; i++) {
                const mem = memTmp[i];
                avt[mem.user._id] = mem.user.avatar;
            }
            setAvatar(avt);
            if (result.code == '1000') {
                setListMessage(result.data.messages);
            };
        })
    }, [socket])
    useEffect(() => {
        scrollToBottom();
    }, [listMessage]);
    useEffect(() => {
        if (!conversation) history.push('/') 
    }, [conversation])
    return (
        <>
            {showAddMember && <ModalAddMember conversationId={conversation._id}
                socket={socket} closeModal={() => setShowAddMember(false)} />}
            <div>
                <div style={{
                    height: 50, width: '100%', position: 'fixed', backgroundColor: 'white', zIndex: 10,
                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                    <Button onClick={() => setShowAddMember(true)}
                        variant="contained">Thêm TV</Button>
                    <Button onClick={() => handleCall()}
                        variant="contained">Call</Button>
                </div>
                <div style={{ width: "100%" }}>
                    <div style={{ overflow: 'hidden', paddingTop: 20 }}>
                        {listMessage.map((e, index) => {
                            return <MessageItem
                                key={e._id} avatar={avatar[e.sender]}
                                mess={e.content} idSender={e.sender} idUser={user.id} keyExtractor={(e) => e._id} />
                        }
                        )}
                        <div style={{marginBottom: 40}} 
                        ref={messageEndRef} />
                    </div>
                </div>
                <div style={{position: 'fixed', bottom: 0}}> 
                    <OutlinedInput value={textMessage}
                        placeholder="Nhập tin nhắn" onChange={(e) => setTextMessage(e.target.value)} />
                    <Button onClick={() => handleSendMessage()}
                        variant="contained">Gửi</Button>
                </div>
            </div>
        </>
    );
}

