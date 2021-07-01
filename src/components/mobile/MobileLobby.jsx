import React, { useContext, useCallback, useState, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobileWait from '../../helpers/components/MobileWait';

const MobileLobbyRow = styled.div`
    ${mixins.flexAlignCenter}
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 10vh;
    font-size: calc(var(--vh, 1vh) * 10);
    text-shadow: 0.075em 0.075em #000;
`;

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
            setMobileLobbyState(MobileLobbyState.IS_WAITING);
        });

        socket.on('submit_signature_failure', () => {
            alert(`That signature was illegal, please try again!`);

            setPlayerName('');
        });

        socket.on('reconnect', () => {
            setMobileLobbyState(MobileLobbyState.IS_WAITING);
        });
    }, []);

    const handleJoinSession = useCallback((sessionName) => {
        socket.emit('join_session', sessionName);
    }, []);

    const handleSubmitSignature = useCallback((playerName) => {
        socket.emit('submit_signature', playerName);
    }, []);

    return (
        <Container fluid>
            {
                mobileLobbyState === MobileLobbyState.SESSION_NAME &&
                <MobileLobbyRow>
                    <Col lg={'12'}>
                        <LogoText>JEOPARTY!</LogoText>

                        <InputGroup className={'mb-3'}>
                            <FormControl placeholder={'Enter session name...'} value={sessionName.toUpperCase()} onChange={e => setSessionName(e.target.value)} aria-describedby={'basic-addon1'} />
                            <InputGroup.Prepend>
                                <Button onClick={() => handleJoinSession(sessionName)} variant={'outline-light'}>JOIN</Button>
                            </InputGroup.Prepend>
                        </InputGroup>
                    </Col>
                </MobileLobbyRow>
            }

            {
                mobileLobbyState === MobileLobbyState.SIGNATURE &&
                <MobileLobbyRow>
                    <Col lg={'12'}>
                        <LogoText>JEOPARTY!</LogoText>

                        <InputGroup className={'mb-3'}>
                            <FormControl placeholder={'Enter your name...'} value={playerName.toUpperCase()} onChange={e => setPlayerName(e.target.value)} aria-describedby={'basic-addon1'} />
                            <InputGroup.Prepend>
                                <Button onClick={() => handleSubmitSignature(playerName)} variant={'outline-light'}>SUBMIT</Button>
                            </InputGroup.Prepend>
                        </InputGroup>
                    </Col>
                </MobileLobbyRow>
            }

            {
                mobileLobbyState === MobileLobbyState.IS_WAITING &&
                <MobileWait player={{ name: playerName, score: 0 }} />
            }
        </Container>
    );
};

export default MobileLobby;
