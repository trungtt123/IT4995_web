import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTextWithIcon } from "../Services/Helper/common";
import default_avatar from '../Assets/images/default_avatar.jpg'
import { useHistory, useLocation } from "react-router-dom";
import OutlinedInput from '@mui/material/OutlinedInput';
import { Button } from "@mui/material";
import ModalAddMember from "../Components/ModalAddMember";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CallIcon from '@mui/icons-material/Call';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Room from "./Room";
function MessageItem(props) {
    if (props.idSender != props.idUser)
        return (
            <div style={{
                position: 'relative', width: '100%', marginLeft: 5, marginBottom: 20,
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <span style={{ alignSelf: 'flex-start' }}>{props?.avatar?.url
                    ? <img src={props?.avatar?.url} style={{ width: 30, height: 30, borderRadius: 15 }} />
                    : <img src={default_avatar} style={{ width: 30, height: 30, borderRadius: 15 }} />}
                </span>
                <span style={{
                    backgroundColor: '#ccc',
                    minHeight: 20,
                    borderRadius: 10,
                    color: 'black',
                    padding: 5,
                    marginLeft: 5,
                    maxWidth: '80%',
                    wordBreak: 'break-word'
                }}>
                    {props.mess}
                </span>
            </div>
        );
    else
        return (
            <div style={{
                width: '100%', display: 'flex',
                justifyContent: 'flex-end', marginBottom: 20,
            }}>
                <span style={{
                    alignSelf: 'flex-end',
                    backgroundColor: '#1976d2',
                    minHeight: 30,
                    borderRadius: 10,
                    color: 'white',
                    padding: 5,
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    marginRight: 5
                }}>
                    {props.mess}
                </span>
            </div>
        );
}
function NewMember({sender, newMember}){
    return <div style={{fontSize: 14, textAlign: 'center'}}>{`${sender?.name} đã thêm ${newMember?.name}`}</div>
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
    const [isCall, setIsCall] = useState(false);
    const conversation = location.state?.conversation;
    //tin nhắn muốn gửi
    const [textMessage, setTextMessage] = useState("");
    const [news, setNews] = useState();
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
        setIsCall(true);
    }
    const handleEndCall = () => {
        document.body.classList.remove('off-scroll');
        setIsCall(false)
    }
    const scrollToBottom = () => {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    useEffect(() => {
        conversation && socket && socket.emit('join_conversation', {
            conversationId: conversation._id,
            token: user.token
        });
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
        });
        socket && socket.on('conversation_add_member', (result) => {
            if (result.code == "1000") {
                setNews(<NewMember sender={result.sender} newMember={result.newMember} />)
            }
          })
    }, [socket])
    useEffect(() => {
        scrollToBottom();
    }, [listMessage]);
    useEffect(() => {
        if (!conversation) history.push('/')
    }, [conversation])
    console.log(conversation);
    return (
        <>
            {showAddMember && <ModalAddMember conversation={conversation}
                socket={socket} closeModal={() => setShowAddMember(false)} />}
            {isCall && <Room roomId={conversation._id} handleEndCall={() => handleEndCall()}/>}
            <div>
                <div style={{
                    height: 50, width: '100%', position: 'fixed', backgroundColor: 'white', zIndex: 10, top: -2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                    <div style={{
                        marginTop: 13, marginLeft: 10, 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', width: '50%',
                        overflow: 'hidden',
                        position:'relative'
                    }}>
                        <ArrowBackIcon style={{marginRight: 10}}
                            onClick={() => history.goBack()} />

                        <span style={{position: 'absolute', top: -2}}>{conversation?.conversationName}</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <PersonAddAlt1Icon style={{ position: 'absolute', top: 13, right: 90 }}
                            onClick={() => setShowAddMember(true)} />
                        <CallIcon style={{ position: 'absolute', top: 13, right: 50 }}
                            onClick={() => handleCall()} />
                        <InfoIcon style={{ position: 'absolute', top: 13, right: 10 }}
                            onClick={() => handleCall()} />
                    </div>
                </div>
                <div style={{ width: "100%", marginTop: 50 }}>
                    <div style={{ overflow: 'hidden', paddingTop: 20, marginBottom: 200 }}>
                        {listMessage.map((e, index) => {
                            return <MessageItem
                                key={e._id} avatar={avatar[e.sender]}
                                mess={e.content} idSender={e.sender} idUser={user.id} keyExtractor={(e) => e._id} />
                        }
                        )}
                        <div ref={messageEndRef} />
                    </div>
                </div>
                <div>
                    <div style={{ position: 'fixed', bottom: 0, height: 60, width: '100%', backgroundColor: '#f5f5f5', padding: 5 }}>
                        <div style={{ textAlign: 'center' }}>
                            <input value={textMessage}
                                style={{
                                    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
                                    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
                                    sans-serif`,
                                    fontWeight: '500',
                                    width: '80%', height: 40, border: 'none', outline: 'none', borderRadius: 20, padding: 5, fontSize: 18,
                                    marginLeft: -30
                                }} placeholder="Nhập tin nhắn" onChange={(e) => setTextMessage(e.target.value)} />
                            {/* <OutlinedInput 
                                 /> */}
                            <span style={{ position: 'relative', marginLeft: 5 }}>
                                <SendRoundedIcon onClick={() => handleSendMessage()}

                                    color="primary" style={{ position: 'absolute', top: -2, fontSize: 30 }} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

