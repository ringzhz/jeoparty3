import React, { useContext, useCallback } from "react";

import {SocketContext} from '../context/socket';

const MobileLobby = () => {
    const socket = useContext(SocketContext);

    const handleResponse = useCallback(() => {
        socket.emit("response");
    }, []);

    return (
        <div>
            Welcome to the mobile lobby!
        </div>
    );
};

export default MobileLobby;
