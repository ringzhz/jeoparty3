import React, {useContext, useState } from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {SocketContext} from '../context/socket';

import '../stylesheets/Game.css';
import '../stylesheets/BrowserLobby.css';

const BrowserLobby = () => {
    const [sessionName, setSessionName] = useState('');
    const socket = useContext(SocketContext);

    socket.on('session_name', (sessionName) => {
        setSessionName(sessionName);
    });

    return (
        <Container fluid className={'browser-lobby'}>
            <Row className={'align-self-center text-center'}>
                <Col lg={'12'}>
                    <h1>Jeoparty! 3</h1>
                </Col>
            </Row>

            <Row className={'text-center'}>
                <Col lg={'12'}>
                    <span>Session name: {sessionName}</span>
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserLobby;
