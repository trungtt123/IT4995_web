import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTextWithIcon } from "../Services/Helper/common";
import default_avatar from '../Assets/images/default_avatar.jpg'
import { useHistory, useLocation } from "react-router-dom";
import OutlinedInput from '@mui/material/OutlinedInput';
import { Button } from "@mui/material";
import ModalAddMember from "../Components/ModalAddMember";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PhotoIcon from '@mui/icons-material/Photo';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CallIcon from '@mui/icons-material/Call';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams } from 'react-router-dom';
import Room from "./Room";
import { callAction } from "../Redux/callSlice";
import { updateConversation } from "../Redux/conversationSlice";
import axios from "../setups/custom_axios";
import userService from "../Services/Api/userService";
import ConfirmModal from "../Components/ConfirmModal";
function MessageItem(props) {
    const { user } = useSelector(
        (state) => state.auth
    );
    if (props.idSender != props.idUser) {
        let seenUser = props?.participants?.filter(o => o.lastSeen.messageId === props?.messData?._id && user.id !== o.user._id);
        return (
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    position: 'relative', width: '100%', marginLeft: 5,
                    display: 'flex',
                    justifyContent: 'flex-start',
                }}>
                    <span style={{ alignSelf: 'flex-start' }}>{props?.avatar?.url
                        ? <img src={props?.avatar?.url} style={{ width: 30, height: 30, borderRadius: 15 }} />
                        : <img src={default_avatar} style={{ width: 30, height: 30, borderRadius: 15 }} />}
                    </span>
                    <span style={{
                        backgroundColor: props?.messData?.type === 'text' ? '#ccc' : '',
                        minHeight: 20,
                        borderRadius: 10,
                        color: 'black',
                        padding: 5,
                        marginLeft: 5,
                        maxWidth: '80%',
                        wordBreak: 'break-word'
                    }}>
                        {props?.messData?.type === 'text' && props?.messData?.content.body}
                        {props?.messData?.type === 'image' && <img src={props?.messData?.content.body[0]} style={{ width: 200, borderRadius: 10 }} />}
                        {props?.messData?.type === 'video' && <video src={props?.messData?.content.body[0]} style={{ width: 200, borderRadius: 10 }} controls />}
                    </span>

                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <div>
                        {seenUser?.map((item, index) => {
                            return <span key={index}>
                                <img src={item?.user?.avatar?.url || default_avatar} style={{ height: 15, width: 15, borderRadius: '50%', marginRight: 5 }} />
                            </span>
                        })}
                    </div>
                </div>
            </div>
        );
    }
    else
        return (
            <div style={{
                width: '100%', display: 'flex',
                justifyContent: 'flex-end', marginBottom: 20,
                flexDirection: 'column'
            }}>
                <span style={{
                    alignSelf: 'flex-end',
                    backgroundColor: props?.messData?.type === 'text' ? '#1976d2' : '',
                    minHeight: 30,
                    borderRadius: 10,
                    color: 'white',
                    padding: 5,
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    marginRight: 5
                }}>
                    {props?.messData?.type === 'text' && props?.messData?.content.body}
                    {props?.messData?.type === 'image' && <img src={props?.messData?.content.body[0]} style={{ width: 200, borderRadius: 10 }} />}
                    {props?.messData?.type === 'video' && <video src={props?.messData?.content.body[0]} style={{ width: 200, borderRadius: 10 }} controls />}
                </span>
                <div style={{
                    alignSelf: 'flex-end',
                }}>
                    {props?.participants?.filter(o => o.lastSeen.messageId === props?.messData?._id && user.id !== o.user._id)?.map((item, index) => {
                        return <span key={index}>
                            <img src={item?.user?.avatar?.url || default_avatar} style={{ height: 15, width: 15, borderRadius: '50%', marginRight: 5 }} />
                        </span>
                    })}
                </div>
            </div>
        );
}
function NewMember({ sender, newMember }) {
    return <div style={{ fontSize: 14, textAlign: 'center' }}>{`${sender?.name} đã thêm ${newMember?.name}`}</div>
}
export default function Conversation({ socket }) {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const { user } = useSelector(
        (state) => state.auth
    );
    const { isCall } = useSelector(
        (state) => state.call
    );
    const { conversationId } = useParams();
    const [listMessage, setListMessage] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [conversation, setConversation] = useState({});
    const [listMember, setListMember] = useState([]);
    const [avatar, setAvatar] = useState({});
    const [participants, setParticipants] = useState([]);
    //tin nhắn muốn gửi
    const [textMessage, setTextMessage] = useState("");
    const [isShowModal, setIsShowModal] = useState(false);

    const [news, setNews] = useState();
    const [lastSeenMessage, setLastSeenMessage] = useState();
    const mess = useRef();
    const messageEndRef = useRef(null);
    const textNoti = useRef("");

    const handleSendMessage = (mess) => {
        socket && socket.emit('new_message', {
            type: 'text',
            token: user.token,
            userId: user.id,
            conversationId: conversationId,
            content: {
                body: textMessage
            }
        });
        setTextMessage('');
    }
    const handleCall = () => {
        dispatch(callAction(true))
        socket.emit('call', {
            conversationId: conversationId,
            token: user.token
        })
    }
    const handleEndCall = () => {
        document.body.classList.remove('off-scroll');
        dispatch(callAction(false))
    }
    const handleGotoConversationInfo = () => {
        history.push('/conversationInfo');
    }
    const scrollToBottom = () => {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    const handleSelectMedia = () => {
        console.log('run');
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';

        // Xử lý sự kiện chọn file
        input.addEventListener('change', async function (event) {
            const selectedFile = event.target.files[0];
            const formData = new FormData();
            console.log('selectedFile', selectedFile);
            let fileSize = +selectedFile?.size / (1024 * 1024);
            const fileExtension = '.' + selectedFile.name.split('.').pop();
            const supportedExtensions = ['.png', '.jpeg', '.jpg', '.mp4'];
            if (!supportedExtensions.includes(fileExtension)) {
                textNoti.current = 'Ứng dụng không hỗ trợ định dạng file này';
                setIsShowModal(true);
                return;
            }
            if (fileSize > 10) {
                textNoti.current = 'Không thể gửi file lớn hơn 10mb';
                setIsShowModal(true);
                return;
            }
            if (selectedFile.type?.includes('image')) {
                formData.append("image", selectedFile);
            }
            if (selectedFile.type?.includes('video')) {
                formData.append("video", selectedFile);
            }
            userService.uploadMedia({ formData }).then((result) => {
                console.log('result', result);
                if (result?.data?.image?.length > 0) {
                    socket && socket.emit('new_message',
                        {
                            conversationId: conversation?._id,
                            userId: user.id,
                            token: user.token,
                            type: 'image',
                            content: {
                                body: [`${result?.data?.image[0]?.url}`]
                            }
                        }
                    );
                }
                if (result?.data?.video?.length > 0) {
                    socket && socket.emit('new_message',
                        {
                            conversationId: conversation?._id,
                            userId: user.id,
                            token: user.token,
                            type: 'video',
                            content: {
                                body: [`${result?.data?.video[0]?.url}`]
                            }
                        }
                    );
                }

            }).catch(e => {
                console.log(e);
            })
            input.remove();
        });

        // Thêm thẻ input vào DOM
        document.body.appendChild(input);
        input.click();
    }
    const handleBack = () => {
        history.goBack();
        conversationId && socket && socket.emit('leave_conversation', {
            conversationId: conversationId,
            token: user.token
        });
    }
    useEffect(() => {
        let isMounted = true; // Thêm biến isMounted để kiểm tra component có còn tồn tại hay không

        conversationId && socket && socket.emit('join_conversation', {
            conversationId: conversationId,
            token: user.token
        });

        // Lắng nghe sự kiện new_message
        socket && socket.on('new_message', (result) => {
            if (isMounted) { // Kiểm tra component còn tồn tại trước khi cập nhật state
                if (result.code === '1000') {
                    setConversation(result.data);
                    dispatch(updateConversation(result.data));
                    const memTmp = result.data.participants;

                    // Xử lý avatar
                    let avt = avatar;
                    for (let i = 0; i < memTmp.length; i++) {
                        const mem = memTmp[i];
                        avt[mem.user._id] = mem.user.avatar;
                    }
                    setAvatar(avt);
                    setParticipants(result.data.participants);
                    setListMessage(result.data.messages);
                }
            }
        });

        // Lắng nghe sự kiện conversation_add_member
        socket && socket.on('conversation_add_member', (result) => {
            if (isMounted) { // Kiểm tra component còn tồn tại trước khi cập nhật state
                if (result.code == "1000") {
                    setNews(<NewMember sender={result.sender} newMember={result.newMember} />);
                }
            }
        });

        return () => {
            isMounted = false; // Đánh dấu component đã unmount
            socket && socket.off('new_message'); // Huỷ đăng ký sự kiện new_message
            socket && socket.off('conversation_add_member'); // Huỷ đăng ký sự kiện conversation_add_member
        };
    }, [socket]);

    useEffect(() => {
        scrollToBottom();
    }, [listMessage]);
    useEffect(() => {
        if (!conversationId) history.push('/')
    }, [conversationId]);
    console.log('conversation', conversation);
    return (
        <>
            {
                isShowModal && <ConfirmModal
                    isShowReject={false}
                    onAccept={() => setIsShowModal(false)}
                    // onReject={() => window.location.reload()}
                    primary={textNoti.current}
                />
            }
            {showAddMember && <ModalAddMember conversation={conversation}
                socket={socket} closeModal={() => setShowAddMember(false)} />}
            {isCall && <Room user={user}
                roomId={conversationId} handleEndCall={() => handleEndCall()} />}
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
                        // overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <ArrowBackIcon style={{ marginRight: 10 }}
                            onClick={() => handleBack()} />

                        <span style={{ position: 'absolute', top: -2 }}>{conversation?.conversationName}</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <PersonAddAlt1Icon style={{ position: 'absolute', top: 13, right: 90 }}
                            onClick={() => setShowAddMember(true)} />
                        <CallIcon style={{ position: 'absolute', top: 13, right: 50 }}
                            onClick={() => handleCall()} />
                        <InfoIcon style={{ position: 'absolute', top: 13, right: 10 }}
                            onClick={() => handleGotoConversationInfo()} />
                    </div>
                </div>
                <div style={{ width: "100%", marginTop: 50 }}>
                    <div style={{ overflow: 'hidden', paddingTop: 20, marginBottom: 200 }}>
                        {listMessage.map((e, index) => {
                            if (e?.type === 'notification') {
                                return <div style={{
                                    textAlign: 'center',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    marginBottom: 10
                                }}
                                    key={e._id}>{e.content.body}</div>
                            }
                            else return <MessageItem participants={participants}
                                key={e._id} avatar={avatar[e.sender]}
                                messData={e} idSender={e.sender} idUser={user.id} keyExtractor={(e) => e._id} />
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
                                    width: '70%', height: 40, border: 'none', outline: 'none', borderRadius: 20, padding: 5, fontSize: 18,
                                    marginLeft: -30
                                }} placeholder="Nhập tin nhắn" onChange={(e) => setTextMessage(e.target.value)} />
                            {/* <OutlinedInput 
                                 /> */}

                            <span style={{ position: 'relative', marginLeft: 10 }}>
                                <PhotoIcon onClick={() => handleSelectMedia()}

                                    color="primary" style={{ position: 'absolute', top: -2, fontSize: 30 }} />

                            </span>
                            <span style={{ position: 'relative', marginLeft: 40 }}>
                                <SendRoundedIcon onClick={() => textMessage && handleSendMessage()}

                                    color="primary" style={{ position: 'absolute', top: -2, fontSize: 30 }} />

                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

