import React, {useContext} from "react";

import {SocketContext} from '../context/socket';

const BrowserLobby = () => {
    const socket = useContext(SocketContext);

    socket.on('hello', (msg) => {
        alert(msg);
        socket.emit('hello', 'world');
    });

    return (
        <div>
            Welcome to the browser lobby!
        </div>
    );
};

export default BrowserLobby;
