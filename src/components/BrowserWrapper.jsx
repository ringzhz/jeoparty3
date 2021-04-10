import React, { useContext, useEffect } from "react";

import { SocketContext } from '../context/socket';

const BrowserWrapper = (props) => {
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('disconnect', () => {
            window.location.reload();
        });
    });

    return (
        <div>
            {props.children}
        </div>
    );
};

export default BrowserWrapper;
