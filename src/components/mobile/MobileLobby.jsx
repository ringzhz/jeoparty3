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
import Sketchpad from '../../helpers/components/Sketchpad';

// DEBUG
import {samplePlayers} from '../../constants/samplePlayers';

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
        WAITING: 'waiting'
    };

    // DEBUG
    // const [sessionName, setSessionName] = useState('');
    // const [playerName, setPlayerName] = useState('');
    // const [mobileLobbyState, setMobileLobbyState] = useState(MobileLobbyState.SIGNATURE);
    // const [player, setPlayer] = useState(samplePlayers['zsS3DKSSIUOegOQuAAAA']);

    const [sessionName, setSessionName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [mobileLobbyState, setMobileLobbyState] = useState(MobileLobbyState.SESSION_NAME);
    const [player, setPlayer] = useState({});

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

        socket.on('submit_signature_success', (player) => {
            setMobileLobbyState(MobileLobbyState.WAITING);
            setPlayer(player);
        });

        socket.on('submit_signature_failure', () => {
            alert(`That signature was illegal, please try again!`);

            setPlayerName('');
        });

        socket.on('reconnect', () => {
            setMobileLobbyState(MobileLobbyState.WAITING);
        });
    }, []);

    const handleJoinSession = useCallback((sessionName) => {
        socket.emit('join_session', sessionName);
    }, []);

    const handleSubmitSignature = useCallback((playerName) => {
        socket.emit('submit_signature', playerName, document.getElementById('signature-canvas').toDataURL());
    }, []);

    return (
        <Container fluid>
            {
                mobileLobbyState === MobileLobbyState.SESSION_NAME &&
                <MobileLobbyRow>
                    <Col lg={'12'}>
                        <LogoText>JEOPARTY!</LogoText>

                        <InputGroup className={'mb-3'}>
                            <FormControl placeholder={'Enter session name...'} value={sessionName.toUpperCase()} onChange={e => setSessionName(e.target.value)} />
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
                            <FormControl placeholder={'Enter your name...'} value={playerName.toUpperCase()} onChange={e => setPlayerName(e.target.value)} />
                        </InputGroup>

                        <Sketchpad onSubmit={() => handleSubmitSignature(playerName)} />
                    </Col>
                </MobileLobbyRow>
            }

            {
                mobileLobbyState === MobileLobbyState.WAITING &&
                <MobileWait player={player} />
            }
        </Container>
    );
};

export default MobileLobby;
