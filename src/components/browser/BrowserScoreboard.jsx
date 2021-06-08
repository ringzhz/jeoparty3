import React, {useState, useEffect, useContext} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { SocketContext } from '../../context/socket';

import styled from 'styled-components';

// DEBUG
// import { samplePlayers, sampleUpdatedPlayers } from '../../constants/samplePlayers';

const PlayerCardRow = styled(Row)`
    height: 25vh;
    padding: 0.5em;
   
    z-index: ${props => props.zIndex};

    transform: ${props => `translate(0, ${25 * props.positionChange}vh)`};
    transition-property: transform;
    transition-duration: 3s;
    transition-timing-function: ease-in-out;
`;

const PlayerCardCol = styled(Col)`
    border: 0.25em solid black;
    box-shadow: 0.5em 0.5em black;
`;

const sortByScore = (players) => Object.values(players).sort((a, b) => b.score - a.score);
const hasPlayerName = (player, playerName) => player.name === playerName;

const PlayerCard = (props) => {
    return (
        <PlayerCardRow positionChange={props.positionChange}>
            <PlayerCardCol lg={'12'}>
                {props.player.name}: {props.player.score}
            </PlayerCardCol>
        </PlayerCardRow>
    );
};

const BrowserScoreboard = () => {
    // DEBUG
    // const [players, setPlayers] = useState(sortByScore(samplePlayers));
    // const [updatedPlayers, setUpdatedPlayers] = useState(sortByScore(sampleUpdatedPlayers));

    const [players, setPlayers] = useState([]);
    const [updatedPlayers, setUpdatedPlayers] = useState([]);

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
        });

        // DEBUG
        // document.body.onkeyup = (e) => {
        //     if (e.keyCode === 32) {
        //         setShowUpdate(true);
        //     }
        // }
    }, []);

    return (
        <Container fluid>
            {players.map((player) => {
                let position = players.findIndex((el) => hasPlayerName(el, player.name));
                let updatedPosition = updatedPlayers.findIndex((el) => hasPlayerName(el, player.name));
                let positionChange = showUpdate ? (updatedPosition - position) : 0;

                let zIndex = Object.keys(players).length - (showUpdate ? updatedPosition : position);
                let playerObject = showUpdate ? updatedPlayers[updatedPosition] : player;

                return <PlayerCard zIndex={zIndex} player={playerObject} positionChange={positionChange} />;
            })}
        </Container>
    );
};

export default BrowserScoreboard;
