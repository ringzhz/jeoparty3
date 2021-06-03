import React, {useState, useEffect, useContext} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { samplePlayers, sampleUpdatedPlayers } from '../constants/samplePlayers';
import { SocketContext } from '../context/socket';

import '../stylesheets/BrowserScoreboard.css';

const sortByScore = (players) => Object.values(players).sort((a, b) => b.score - a.score);
const hasPlayerName = (player, playerName) => player.name === playerName;

const PlayerCard = (props) => {
    return (
        <Row style={{ transform: `translate(0, ${25 * props.positionChange}vh)` }} className={'player-card-row'}>
            <Col lg={'12'} className={'player-card-col'}>
                {props.player.name}: {props.player.score}
            </Col>
        </Row>
    );
};

const BrowserScoreboard = () => {
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
    }, []);

    return (
        <Container fluid>
            {players.map((player) => {
                let position = players.findIndex((el) => hasPlayerName(el, player.name));
                let updatedPosition = updatedPlayers.findIndex((el) => hasPlayerName(el, player.name));
                let positionChange = showUpdate ? (updatedPosition - position) : 0;

                let zIndex = 4 - (showUpdate ? updatedPosition : position);
                let playerObject = showUpdate ? updatedPlayers[updatedPosition] : player;

                return <PlayerCard style={{ zIndex: `${zIndex}` }} player={playerObject} positionChange={positionChange} />;
            })}
        </Container>
    );
};

export default BrowserScoreboard;
