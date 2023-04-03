import React, { useState, useEffect } from "react";
import { _getCache, _setCache } from "../Services/Helper/common";
import { useDispatch, useSelector } from "react-redux";
import ModalCreateConversation from "../Components/ModalCreateConversation";
import Button from '@mui/material/Button';
import { useHistory } from "react-router-dom";
export default function Conversations({ socket }) {
    const dispatch = useDispatch();
    const history = useHistory();
    const [conversations, setConversations] = useState([]);
    const [showModalCreateConversation, setShowModalCreateConversation] = useState(false);
    const { user } = useSelector(
        (state) => state.auth
    );
    const goToConversation = (conversation) => {
        history.push({
            pathname: '/conversation',
            state: { conversation: conversation }
        });
    }
    useEffect(() => {
        socket.emit('me', { userId: user.id });
        socket.emit('get_list_conversation', {
            userId: user.id,
            token: user.token
        });
        socket.on('conversation_change', (result) => {
            console.log(result)
            if (result.code == "1000") {
                setConversations(result.data)
            }
        })
    }, [socket])
    return (
        <>
            {showModalCreateConversation
                && <ModalCreateConversation socket={socket}
                    closeModal={() => setShowModalCreateConversation(false)} />}
            <div style={{ marginTop: 30 }}>
                {conversations?.map((item, index) => {
                    return <div key={item._id} onClick={() => goToConversation(item)}
                        style={{ padding: 5, height: 100, border: 'solid 1px #ccc', margin: 5, borderRadius: 20 }}>
                        <div>{item.conversationName}</div>
                        <div>{item?.messages[item?.messages.length - 1]?.content}</div>
                    </div>
                })}
            </div>
            <div style={{textAlign: 'center'}}>
            <Button onClick={() => setShowModalCreateConversation(true)}
            variant="contained">TẠO MỚI</Button>
            </div>
        </>)
}
