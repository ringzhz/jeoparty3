import React, { useContext, useEffect } from 'react';

import { createGlobalStyle } from 'styled-components';

import { SocketContext } from '../../context/socket';

const GlobalStyle = createGlobalStyle`
    .btn:hover {
        background-color: transparent;
        color: white;
    }
`;

const MobileWrapper = (props) => {
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('reload', () => {
            window.location.reload();
        });

        socket.on('disconnect', () => {
            // TODO: Make this a clickable reload button using the same screen blur as BrowserLobby
            console.log(`You've been disconnected!`);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <GlobalStyle />
            {props.children}
        </div>
    );
};

export default MobileWrapper;
