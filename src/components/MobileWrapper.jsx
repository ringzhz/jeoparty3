import React, { useContext, useEffect } from "react";

import { SocketContext } from '../context/socket';

const MobileWrapper = (props) => {
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('disconnect', () => {
            // TODO: Make this a react-bootstrap alert
            console.log(`You've been disconnected!`);
        });
    });

    return (
        <div>
            {props.children}
        </div>
    );
};

export default MobileWrapper;
