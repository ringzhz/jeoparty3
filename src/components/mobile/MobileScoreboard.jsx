import React, { useState, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import { SocketContext } from '../../context/socket';
import MobileWait from '../../helpers/components/MobileWait';

// DEBUG
import { samplePlayers } from '../../constants/samplePlayers';

const MobileScoreboard = () => {
    // DEBUG
    // const [player, setPlayer] = useState(samplePlayers['zsS3DKSSIUOegOQuAAAA']);

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

export default MobileScoreboard;
