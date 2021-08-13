import React, { useState, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import { DebugContext } from "../../context/debug";
import { SocketContext } from '../../context/socket';
import MobileWait from '../../helpers/components/MobileWait';

// DEBUG
import { samplePlayers } from '../../constants/samplePlayers';

const MobileScoreboard = () => {
    const debug = useContext(DebugContext);

    const [player, setPlayer] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('player', (player) => {
            setPlayer(player);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container fluid>
            <MobileWait player={player} />
        </Container>
    );
};

export default MobileScoreboard;
