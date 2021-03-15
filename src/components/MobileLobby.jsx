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
        WAITING: 'waiting'
    };

    const [sessionName, setSessionName] = useState('');
    const [mobileLobbyState, setMobileLobbyState] = useState(MobileLobbyState.SESSION_NAME);
    const socket = useContext(SocketContext);

    const handleJoinSession = useCallback((sessionName) => {
        socket.emit('join_session', sessionName);
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
                    </Col>
                </Row>
            }

            {
                mobileLobbyState === MobileLobbyState.WAITING &&
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
