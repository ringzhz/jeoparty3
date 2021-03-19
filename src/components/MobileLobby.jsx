import React, { useContext, useCallback, useState, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';

import {SocketContext} from '../context/socket';

const MobileLobby = () => {
    const MobileLobbyState = {
        SESSION_NAME: 'sessionName',
        SIGNATURE: 'signature',
        IS_WAITING: 'isWaiting'
    };

    const [sessionName, setSessionName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [mobileLobbyState, setMobileLobbyState] = useState(MobileLobbyState.SESSION_NAME);
    const socket = useContext(SocketContext);

    const handleJoinSession = useCallback((sessionName) => {
        socket.emit('join_session', sessionName);
    }, []);

    const handleSubmitSignature = useCallback((playerName) => {
        socket.emit('submit_signature', playerName);
    }, []);

    useEffect(() => {
        socket.on('join_session_success', (sessionName) => {
            alert(`You joined session (${sessionName})`);

            setSessionName('');
            setMobileLobbyState(MobileLobbyState.SIGNATURE);
        });

        socket.on('join_session_failure', (sessionName) => {
            alert(`Couldn't find session (${sessionName})`);

            setSessionName('');
        });

        socket.on('submit_signature_success', () => {
            setPlayerName('');
            setMobileLobbyState(MobileLobbyState.IS_WAITING);
        });

        socket.on('submit_signature_failure', () => {
            alert(`That signature was illegal, please try again!`);

            setPlayerName('');
        });

        // TODO: Other components with sub-state need reconnect conditions
        socket.on('reconnect', () => {
            setMobileLobbyState(MobileLobbyState.IS_WAITING);
        });
    }, []);

    return (
        <Container fluid>
            {
                mobileLobbyState === MobileLobbyState.SESSION_NAME &&
                <Row className={'text-center'}>
                    <Col lg={'12'}>
                        Welcome to the mobile lobby!

                        <InputGroup className='mb-3'>
                            <FormControl value={sessionName} onChange={e => setSessionName(e.target.value)} aria-describedby='basic-addon1' />
                            <InputGroup.Prepend>
                                <Button onClick={() => handleJoinSession(sessionName)} variant='outline-secondary'>Join</Button>
                            </InputGroup.Prepend>
                        </InputGroup>
                    </Col>
                </Row>
            }

            {
                mobileLobbyState === MobileLobbyState.SIGNATURE &&
                <Row className={'text-center'}>
                    <Col lg={'12'}>
                        You're in a session!

                        <InputGroup className='mb-3'>
                            <FormControl value={playerName} onChange={e => setPlayerName(e.target.value)} aria-describedby='basic-addon1' />
                            <InputGroup.Prepend>
                                <Button onClick={() => handleSubmitSignature(playerName)} variant='outline-secondary'>Submit</Button>
                            </InputGroup.Prepend>
                        </InputGroup>
                    </Col>
                </Row>
            }

            {
                mobileLobbyState === MobileLobbyState.IS_WAITING &&
                <Row className={'text-center'}>
                    <Col lg={'12'}>
                        You're waiting!
                    </Col>
                </Row>
            }
        </Container>
    );
};

export default MobileLobby;
