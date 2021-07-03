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
            // TODO: Make this a react-bootstrap alert
            console.log(`You've been disconnected!`);
        });
    });

    return (
        <div>
            <GlobalStyle />
            {props.children}
        </div>
    );
};

export default MobileWrapper;
