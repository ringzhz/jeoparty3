import React, { useContext, useEffect } from 'react';

import { SocketContext } from '../../context/socket';

const BrowserWrapper = (props) => {
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('disconnect', () => {
            window.location.reload();
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    document.onkeyup = (e) => {
        if (e.keyCode === 32) {
            socket.emit('debug_disconnect');
        }
    };

    return (
        <div>
            {props.children}
        </div>
    );
};

export default BrowserWrapper;
