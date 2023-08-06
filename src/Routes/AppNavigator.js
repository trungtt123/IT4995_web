import React, { useEffect, useRef, useState } from 'react';
import { HashRouter, Route, Switch, useHistory } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import Login from './Login';
import Room from './Room';
import { useDispatch, useSelector } from "react-redux";
import Conversations from './Conversations';
import { io } from 'socket.io-client';
import { CHAT_SERVER_URL } from '../Services/Helper/constant';
import Conversation from './Conversation';
import { verifyToken } from '../Redux/authSlice';
import Loading from '../Components/Loading';
import Signup from './Signup';
import Home from './Home';
import Profile from './Profile';
import ChangePassword from './ChangePassword';
import RequestFriend from './RequestFriend';
import OtherProfile from './OtherProfile';
import CallNotification from './CallNotification';
import { createHashHistory } from 'history';
import ConversationInfo from './ConversationInfo';
const customHistory = createHashHistory();
function AppNavigator(props) {
    const dispatch = useDispatch();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
  		
  	useEffect(() => {
    	function onlineHandler() {
      		setIsOnline(true);
    	}
	
    	function offlineHandler() {
      		setIsOnline(false);
    	}
	
    	window.addEventListener("online", onlineHandler);
    	window.addEventListener("offline", offlineHandler);

	
    	return () => {
      		window.removeEventListener("online", onlineHandler);
      		window.removeEventListener("offline", offlineHandler);
    	};
  	}, []);
    const [socket, setSocket] = useState(io(`${CHAT_SERVER_URL}`));
    const { isCall } = useSelector(
        (state) => state.call
    );
    const { isLoading, isAuthenticated, user } = useSelector(
        (state) => state.auth
    );
    const { conversationData } = useSelector(
        (state) => state.conversation
    );
    useEffect(() => {
        dispatch(verifyToken());
    }, []);
    useEffect(() => {
        console.log('isCall', isCall);
    }, [isCall])
    useEffect(() => {
        let callListener = (data) => {
            console.log(data);
            if (data.code === "1000") {
                console.log('data', user);
                if (data.senderId !== user.id)
                    customHistory.push(`/callNotification?conversationId=${data.conversationId}&conversationName=${data.conversationName}&senderId=${data.senderId}`)
            }
        };

        if (!isCall && socket && user) {
            socket.on('call', callListener);
        }

        return () => {
            if (socket) {
                socket.off('call', callListener);
            }
        };
    }, [socket, user, isCall])
    useEffect(() => {
        setSocket(io(`${CHAT_SERVER_URL}`));
    }, [isOnline])
    console.log('socket', socket);
    return (
        <>
            <HashRouter>
                {
                    isLoading ? <Loading /> :
                        !isAuthenticated && <Switch>
                            <Route path="/signup" exact component={Signup} />
                            <Route path="/" component={Login} />
                        </Switch>
                }
                {
                    isAuthenticated && <Switch>
                        <Route path="/conversation/:conversationId" exact render={() => <Conversation socket={socket} />} />
                        <Route path="/conversationInfo" exact render={() => <ConversationInfo socket={socket} conversation={conversationData}/>} />
                        <Route path="/profile" exact component={Profile} />
                        <Route path="/otherProfile" exact component={OtherProfile} />
                        <Route path="/createRoom" exact component={CreateRoom} />
                        <Route path="/requestFriend" exact component={RequestFriend} />
                        <Route path="/callNotification" exact render={() => <CallNotification socket={socket} />} />
                        <Route path="/changePassword" exact component={ChangePassword} />
                        <Route path="/" render={() => <Home socket={socket} />} />
                    </Switch>
                }
            </HashRouter>
        </>

    );
}

export default AppNavigator;
