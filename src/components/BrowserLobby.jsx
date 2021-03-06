import React, {useContext, useState } from "react";

import {SocketContext} from '../context/socket';

const BrowserLobby = () => {
    const [sessionName, setSessionName] = useState('');
    const socket = useContext(SocketContext);

    socket.on('session_name', (sessionName) => {
        setSessionName(sessionName);
    });

    return (
        <div>
            Welcome to the browser lobby!<br />
            Session name: {sessionName}
        </div>
    );
};

export default BrowserLobby;
