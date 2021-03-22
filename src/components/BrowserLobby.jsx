import React, { useContext, useState, useEffect, useCallback } from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { SocketContext } from '../context/socket';

import '../stylesheets/Game.css';
import '../stylesheets/BrowserLobby.css';

const BrowserLobby = () => {
    const [sessionName, setSessionName] = useState('');
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('session_name', (sessionName) => {
            setSessionName(sessionName);
        });

        socket.on('start_game_failure', () => {
            alert(`There aren't any players in this session!`);
        });
    }, []);

    const handleStartGame = useCallback(() => {
        socket.emit('start_game');
    }, []);

    return (
        <Container fluid className={'browser-lobby'}>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    <h1>Jeoparty! 3</h1>
                </Col>

                <Col lg={'12'}>
                    <span>Session name: {sessionName}</span>
                </Col>

                <Col lg={'12'}>
                    <InputGroup className='mb-3 justify-content-center'>
                        <Button onClick={() => handleStartGame()} variant='light'>Start Game</Button>
                    </InputGroup>
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserLobby;
