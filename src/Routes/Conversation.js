import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTextWithIcon } from "../Services/Helper/common";
import default_avatar from '../Assets/images/default_avatar.jpg'
import { useHistory, useLocation } from "react-router-dom";
import OutlinedInput from '@mui/material/OutlinedInput';
function MessageItem(props) {
    if (props.idSender != props.idUser)
        return (
            <div style={{ height: 40 }}>
                <span>{props?.avatar?.url
                    ? <img src={props?.avatar?.url} style={{ width: 30, height: 30, borderRadius: 15 }} />
                    : <img src={default_avatar} style={{ width: 30, height: 30, borderRadius: 15 }} />}
                </span>
                <span>
                    {props.mess}
                </span>
            </div>
        );
    else
        return (
            <div style={{ height: 40 }}>
                <div style={{ float: 'right' }}>
                    {props.mess}
                </div>
            </div>
        );
}

export default function Conversation({ socket }) {
    const location = useLocation();
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
            content: getTextWithIcon(mess + " ")
        });
    }
    const handleBack = () => {
        // socket?.emit('client_leave_conversation', {
        //   token: user.token,
        //   thisUserId: user.id,
        //   targetUserId: userId
        // })
        // navigation.goBack();
    }
    const handleAddMember = () => {
        setShowAddMember(true);
    }

    const scrollToBottom = () => {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        socket && socket.emit('join_conversation', {
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
    return (
        <>
            {/* {showAddMember && <ModalAddMember conversationId={conversation._id} socket={socket}
        closeModal={() => setShowAddMember(false)} />} */}
            <div>
                {/* thanh tim kiem */}
                {/* <View style={{ marginTop: 10 }}>
        <TextInput
          style={{
            fontSize: 17,
            backgroundColor: '#f1f2f4',
            marginTop: 0,
            height: 40,
            paddingRight: 10,
            paddingLeft: 10,
            borderRadius: 25
          }}
          placeholder=" Tìm kiếm trong cuộc trò chuyện "
          keyboardType="default"
        >
          <Ionicons style={{ border: 1, width: 20, marginTop: 2 }} name="search" size={20} color="grey" />
          <Text style={{ color: "grey" }}> Tìm kiếm trong cuộc trò chuyện </Text>
        </TextInput>
      </View> */}


                <div
                    //     showsHorizontalScrollIndicator={false}
                    //   showsVerticalScrollIndicator={false}
                    //   ref={ref => { mess.current = ref }}
                    //   onContentSizeChange={() => mess.current.scrollToEnd({ animated: true })}
                    style={{ width: "100%"}}>
                    <div style={{overflow: 'hidden' }}>
                        {listMessage.map((e, index) => {
                            return <MessageItem
                                key={e._id} avatar={avatar[e.sender]}
                                mess={e.content} idSender={e.sender} idUser={user.id} keyExtractor={(e) => e._id} />
                        }
                        )}
                        <div ref={messageEndRef} />
                    </div>
                </div>
                <OutlinedInput placeholder="Please enter text" />
                {/* <View style={styles.nhapTinNhan}>
          <AntDesign name="appstore1" size={24} color="#0099ff" style={{ marginLeft: 5 }} />
          <Entypo name="camera" size={24} color="#0099ff" style={{ marginLeft: 10 }} />
          <Entypo name="image" size={24} color="#0099ff" style={{ marginLeft: 10 }} />
          <Entypo name="mic" size={24} color="#0099ff" style={{ marginLeft: 10 }} />
          <TextInput
            style={{
              fontSize: 17,
              backgroundColor: '#f2f3f4',
              marginLeft: 10,
              height: 40,
              width: "50%",
              paddingRight: 10,
              paddingLeft: 10,
              borderRadius: 25
            }}
            placeholder=" Aa"
            keyboardType="default"
            value={getTextWithIcon(textMessage)}
            onChangeText={(text) => { setTextMessage(text); }}
            onSubmitEditing={async () => { await handleSendMessage(textMessage); setTextMessage(""); }}
          ></TextInput>
          <AntDesign name="like1" size={24} color="#0099ff" style={{ marginLeft: 10 }} />
        </View> */}

            </div>
        </>
    );
}

