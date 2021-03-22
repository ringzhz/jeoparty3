import React, {useState, useEffect, useContext} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { SocketContext } from '../context/socket';

const BrowserScoreboard = () => {
    const [players, setPlayers] = useState({});
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('players', (players) => {
            setPlayers(players);
        });
    }, []);

    // TODO: Organize player objects by score and display relevant data

    return (
        <Container fluid>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    Welcome to the browser scoreboard page!
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserScoreboard;
