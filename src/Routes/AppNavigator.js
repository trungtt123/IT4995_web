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
import { createBrowserHistory } from 'history';
const socket = io(`${CHAT_SERVER_URL}`);
const customHistory = createBrowserHistory();
function AppNavigator(props) {
    const { isLoading, isAuthenticated } = useSelector(
        (state) => state.auth
    );
    const history = useHistory();
    // const [isCall, setIsCall] = useState(false);
    const [roomCall, setRoomCall] = useState();
    const roomElm = useRef();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(verifyToken());
    }, []);
    const handleEndCall = () => {
        // setIsCall(false);
    }
    useEffect(() => {
        socket.on('call', (data) => {
            if (data.code === "1000") {
                // customHistory.push('/callNotification')
                window.location.href = '/callNotification';
            }
        })
    }, [socket])
    console.log('isAuthen', isAuthenticated);
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
                        <Route path="/conversation" exact render={() => <Conversation socket={socket} />} />
                        <Route path="/profile" exact component={Profile} />
                        <Route path="/otherProfile" exact component={OtherProfile} />
                        <Route path="/createRoom" exact component={CreateRoom} />
                        <Route path="/requestFriend" exact component={RequestFriend} />
                        <Route path="/callNotification" exact render={() => <CallNotification socket={socket}/>} />
                        <Route path="/changePassword" exact component={ChangePassword} />
                        <Route path="/" render={() => <Home socket={socket} />} />
                    </Switch>
                }
            </HashRouter>
        </>

    );
}

export default AppNavigator;
