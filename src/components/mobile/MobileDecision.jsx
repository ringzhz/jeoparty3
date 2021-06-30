import React, { useState, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import { SocketContext } from '../../context/socket';
import MobileWait from '../../helpers/components/MobileWait';

const MobileDecision = () => {
    const [player, setPlayer] = useState({});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('player', (player) => {
            setPlayer(player);
        });
    }, []);

    return (
        <Container fluid>
            <MobileWait player={player} />
        </Container>
    );
};

export default MobileDecision;
