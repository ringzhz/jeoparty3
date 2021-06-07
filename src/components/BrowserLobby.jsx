import React, { useContext, useState, useEffect, useCallback } from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { sampleLeaderboard } from '../constants/sampleLeaderboard';
import { SocketContext } from '../context/socket';

import '../stylesheets/Game.css';
import '../stylesheets/BrowserLobby.css';

const BrowserLobby = () => {
    const [playerNames, setPlayerNames] = useState([]);
    const [sessionName, setSessionName] = useState('test');
    const [leaderboard, setLeaderboard] = useState([]);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('session_name', (sessionName) => {
            setSessionName(sessionName);
        });

        socket.on('start_game_failure', () => {
            alert(`There aren't any players in this session!`);
        });

        socket.on('new_player_name', (player_name) => {
            setPlayerNames(playerNames.concat([player_name]));
        });
    }, []);

    const handleStartGame = useCallback(() => {
        socket.emit('start_game');
    }, []);

    return (
        <Container fluid className={'browser-lobby'}>
            <Row className={'logo-row text-center'}>
                <Col lg={'12'}>
                    <h1 className={'logo-text'}>JEOPARTY!</h1>
                    <h5 className={'clue-text join-text'}><span>JOIN ON YOUR PHONE AT JEOPARTY.IO</span></h5>
                </Col>
            </Row>

            <Row className={'info-row text-center'}>
                <Col lg={'4'}>
                    <h1 className={'info-heading'}>PLAYERS</h1>
                    <ul>
                        {playerNames.map((name) => {
                            return <li><h5 className={'clue-text'}>{name.toUpperCase()}</h5></li>
                        })}
                    </ul>
                </Col>

                <Col lg={'4'}>
                    <h1 className={'info-heading session-name-heading'}>SESSION NAME</h1>
                    <h1 className={'session-name-text'}>{sessionName.toUpperCase()}</h1>
                    <InputGroup className={'mb-3 justify-content-center start-game-button'}>
                        <Button onClick={() => handleStartGame()} variant={'outline-light'}>START GAME</Button>
                    </InputGroup>
                </Col>

                <Col lg={'4'}>
                    <h1 className={'info-heading'}>LEADERBOARD</h1>
                    <Row>
                        <Col className={'leaderboard-player-names'} lg={'6'}>
                            <ul>
                                {leaderboard.map((player) => {
                                    return <li><h5 className={'clue-text'}>{player.name.toUpperCase()}</h5></li>
                                })}
                            </ul>
                        </Col>

                        <Col className={'leaderboard-scores'} lg={'6'}>
                            <ul>
                                {leaderboard.map((player) => {
                                    return <li><h5 className={'clue-text'}>${player.score}</h5></li>
                                })}
                            </ul>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserLobby;
