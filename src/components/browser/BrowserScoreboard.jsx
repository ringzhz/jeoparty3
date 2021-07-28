import React, {useState, useEffect, useContext} from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import HypeText from '../../helpers/components/HypeText';
import { timers } from '../../constants/timers';

import { sayBestStreakFiller } from '../../helpers/sayFiller';

// DEBUG
import { samplePlayers, sampleUpdatedPlayers } from '../../constants/samplePlayers';

const PlayerCardRow = styled(Row)`
    height: ${props => `calc(100vh / ${props.numPlayers})`};
    padding: 0.5em;
   
    z-index: ${props => props.zIndex};
    transform: ${props => `translate(0, ${(100 / props.numPlayers) * props.positionChange}vh)`};
    transition-property: transform;
    transition-duration: 2s;
    transition-timing-function: ease-in-out;
`;

const PlayerCardCol = styled(Col)`
    border: 0.25em solid black;
    box-shadow: 0.25em 0.25em black;
`;

const InfoRow = styled(Row)`
    height: 100%;
`;

const SignatureCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const Signature = styled.img`
    display: block;
    margin: 0 auto;
    
    height: ${props => `${70 / props.numPlayers}vh`};
    height: ${props => `calc(var(--vh, 1vh) * ${70 / props.numPlayers})`};
    width: ${props => `${70 / props.numPlayers}vh`};
    width: ${props => `calc(var(--vh, 1vh) * ${70 / props.numPlayers})`};
    
    background-color: white;
    border: 0.25em solid black;
    box-shadow: 0.25em 0.25em black;
`;

const PlayerNameCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const PlayerNameText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const HypeCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const PlayerScoreCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const PlayerScoreText = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.1em 0.1em #000;
`;

const sortByScore = (players) => Object.values(players).sort((a, b) => b.score - a.score);
const sortByStreak = (players) => Object.values(players).sort((a, b) => b.streak - a.streak);
const hasPlayerName = (player, playerName) => player.name === playerName;

const PlayerCard = (props) => {
    return (
        <PlayerCardRow numPlayers={_.get(props, 'numPlayers')} positionChange={_.get(props, 'positionChange')}>
            <PlayerCardCol lg={'12'}>
                <InfoRow>
                    <SignatureCol lg={'3'}>
                        <Signature src={_.get(props, 'player.signature')} numPlayers={_.get(props, 'numPlayers')} />
                    </SignatureCol>

                    <PlayerNameCol lg={'3'}>
                        <FitText compressor={0.5}>
                            <PlayerNameText>{_.invoke(_.get(props, 'player.name'), 'toUpperCase')}</PlayerNameText>
                        </FitText>
                    </PlayerNameCol>

                    <HypeCol lg={'3'}>
                        <FitText compressor={1}>
                            <HypeText text={_.invoke(_.get(props, 'player.title'), 'toUpperCase')} rainbow={true} />
                        </FitText>
                    </HypeCol>

                    <PlayerScoreCol lg={'3'}>
                        <FitText compressor={0.5}>
                            <PlayerScoreText>
                                <DollarValueText dollarValue={_.get(props, 'player.score')} />
                            </PlayerScoreText>
                        </FitText>
                    </PlayerScoreCol>
                </InfoRow>
            </PlayerCardCol>
        </PlayerCardRow>
    );
};

const BrowserScoreboard = () => {
    const debug = useContext(DebugContext);

    const [players, setPlayers] = useState(debug ? sortByScore(samplePlayers) : []);
    const [updatedPlayers, setUpdatedPlayers] = useState(debug ? sortByScore(sampleUpdatedPlayers) : []);

    const [showUpdate, setShowUpdate] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('players', (players) => {
            setPlayers(sortByScore(players));
        });

        socket.on('updated_players', (updatedPlayers) => {
            setUpdatedPlayers(sortByScore(updatedPlayers));
        });

        socket.on('show_update', () => {
            setShowUpdate(true);

            const bestStreakPlayer = sortByStreak(updatedPlayers)[0];
            if (_.get(bestStreakPlayer, 'streak') && _.get(bestStreakPlayer, 'streak') >= 2) {
                sayBestStreakFiller(bestStreakPlayer.name, bestStreakPlayer.streak, bestStreakPlayer.title, () => setTimeout(() => {
                    socket.emit('show_board');
                }, 500));
            } else {
                setTimeout(() => {
                    socket.emit('show_board');
                }, timers.SHOW_SCOREBOARD_UPDATE_TIME * 1000);
            }
        });

        return () => {
            socket.off('show_update');
        };
    }, []);

    if (debug) {
        document.body.onkeyup = (e) => {
            if (e.keyCode === 32) {
                setShowUpdate(true);

                const bestStreakPlayer = sortByStreak(updatedPlayers)[0];
                if (_.get(bestStreakPlayer, 'streak') && _.get(bestStreakPlayer, 'streak') >= 2) {
                    sayBestStreakFiller(bestStreakPlayer.name, bestStreakPlayer.streak, bestStreakPlayer.title);
                }
            }
        }
    }

    return (
        <Container fluid>
            {players.map((player) => {
                const numPlayers = Math.min(Math.max(3, Object.keys(players).length), 5);

                const position = players.findIndex((el) => hasPlayerName(el, player.name));
                const updatedPosition = updatedPlayers.findIndex((el) => hasPlayerName(el, player.name));
                const positionChange = showUpdate ? (updatedPosition - position) : 0;

                const zIndex = numPlayers - (showUpdate ? updatedPosition : position);
                const playerObject = showUpdate ? updatedPlayers[updatedPosition] : player;

                return <PlayerCard numPlayers={numPlayers} zIndex={zIndex} player={playerObject} positionChange={positionChange} />;
            })}
        </Container>
    );
};

export default BrowserScoreboard;
