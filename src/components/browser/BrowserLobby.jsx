import React, { useContext, useState, useEffect, useCallback } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { SocketContext } from '../../context/socket';
import say from '../../helpers/say';
import mixins from '../../helpers/mixins';
import HypeText from '../../helpers/components/HypeText';
import DollarValueText from '../../helpers/components/DollarValueText';

// DEBUG
import { sampleLeaderboard } from '../../constants/sampleLeaderboard';

const LogoRow = styled(Row)`
    ${mixins.flexAlignCenter}
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 28vh;
    text-shadow: 0.05em 0.05em #000;

    margin-bottom: 0;
`;

const InfoText = styled.h5`
    font-family: clue, serif;
    font-size: 3vh;
    text-shadow: 0.15em 0.15em #000;
`;

const JoinText = styled(InfoText)`
    display: flex;
    flex-direction: row;

    padding-left: 28vw;
    padding-right: 28vw;
    
    &:before, :after {
        content: '';
        flex: 1 1;
        border-bottom: 0.075em solid;
        margin: auto;
    }
    
    &:before {
        margin-right: 0.75em;
    }
    
    &:after {
        margin-left: 0.75em;
    }
`;

const InfoRow = styled(Row)`
    margin-top: 1.5em;
`;

const InfoHeading = styled.h1`
    font-family: board, serif;
    font-size: 6vh;
    text-shadow: 0.1em 0.1em #000;
    letter-spacing: 0.02em;
`;

const SessionNameText = styled.h1`
    font-family: board, serif; 
    font-size: 15vh;
    color: #d69f4c;
    text-shadow: 0.075em 0.075em #000;
`;

const StartGameInputGroup = styled(InputGroup)`
    position: absolute;
    bottom: 4%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
`;

const StartGameButton = styled(Button)`
    font-family: clue, serif;
    font-size: 3vh;
`;

const InfoList = styled.ul`
    padding-inline-start: 0;
    list-style-type: none;
`;

const LeaderboardPlayerNames = styled(Col)`
    text-align: right;
`;

const LeaderboardScores = styled(Col)`
    text-align: left;
`;

const BrowserLobby = () => {
    // DEBUG
    // const [playerNames, setPlayerNames] = useState(['Luffy', 'Nami', 'Zoro']);
    // const [sessionName, setSessionName] = useState('TEST');
    // const [leaderboard, setLeaderboard] = useState(sampleLeaderboard);

    const [playerNames, setPlayerNames] = useState([]);
    const [sessionName, setSessionName] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('session_name', (sessionName) => {
            setSessionName(sessionName);
        });

        socket.on('start_game_failure', () => {
            alert(`There aren't any players in this session!`);
        });

        socket.on('new_player_name', (playerName) => {
            setPlayerNames(playerNames.concat([playerName]));
        });

        // TODO: Add leaderboard
        socket.on('leaderboard', (leaderboard) => {
            setLeaderboard(leaderboard);
        });

        // DEBUG
        // document.body.onkeyup = (e) => {
        //     if (e.keyCode === 32) {
        //     }
        // }
    }, []);

    const handleStartGame = useCallback(() => {
        socket.emit('start_game');
    }, []);

    return (
        <Container fluid>
            <LogoRow>
                <Col lg={'12'}>
                    <LogoText>JEOPARTY!</LogoText>
                    <JoinText>JOIN ON YOUR PHONE AT JEOPARTY.IO</JoinText>
                </Col>
            </LogoRow>

            <InfoRow>
                <Col lg={'4'}>
                    <InfoHeading>PLAYERS</InfoHeading>
                    <InfoList>
                        {playerNames.map((name) => {
                            return <li><InfoText><HypeText text={name.toUpperCase()} /></InfoText></li>
                        })}
                    </InfoList>
                </Col>

                <Col lg={'4'}>
                    <InfoHeading>SESSION NAME</InfoHeading>
                    <SessionNameText>{sessionName.toUpperCase()}</SessionNameText>
                </Col>

                <Col lg={'4'}>
                    <InfoHeading>LEADERBOARD</InfoHeading>
                    <Row>
                        <LeaderboardPlayerNames lg={'6'}>
                            <InfoList>
                                {leaderboard.map((player) => {
                                    return <li><InfoText>{player.name.toUpperCase()}</InfoText></li>
                                })}
                            </InfoList>
                        </LeaderboardPlayerNames>

                        <LeaderboardScores lg={'6'}>
                            <InfoList>
                                {leaderboard.map((player) => {
                                    return (
                                        <li>
                                            <InfoText>
                                                <DollarValueText dollarValue={player.score} />
                                            </InfoText>
                                        </li>
                                    );
                                })}
                            </InfoList>
                        </LeaderboardScores>
                    </Row>
                </Col>
            </InfoRow>

            <StartGameInputGroup className={'mb-3 justify-content-center'}>
                <StartGameButton onClick={() => handleStartGame()} variant={'outline-light'}>START GAME</StartGameButton>
            </StartGameInputGroup>
        </Container>
    );
};

export default BrowserLobby;
