import React, {useContext} from "react";

import {SocketContext} from '../context/socket';

const MobileWrapper = (props) => {
    const socket = useContext(SocketContext);

    socket.on('disconnect', () => {
        alert(`You've been disconnected!`);
    });

    return (
        <div>
            {props.children}
        </div>
    );
};

export default MobileWrapper;
