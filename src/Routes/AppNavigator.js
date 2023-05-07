import React, { useEffect } from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
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
const socket = io(`${CHAT_SERVER_URL}`);
function AppNavigator(props) {
    const { isLoading, isAuthenticated } = useSelector(
        (state) => state.auth
    );
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(verifyToken());
    }, [])
    console.log('isAuthen', isAuthenticated);
    return (
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
                    <Route path="/conversation" exact render={() => <Conversation socket={socket} />}/>
                    <Route path="/profile" exact component={Profile}/>
                    <Route path="/createRoom" exact component={CreateRoom} />
                    <Route path="/room" exact component={Room} />
                    <Route path="/" render={() => <Home socket={socket}/>} />
                </Switch>
            }
        </HashRouter>
    );
}

export default AppNavigator;
