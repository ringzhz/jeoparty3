import React, { useState, useEffect } from 'react';
import { BrowserView, MobileView } from 'react-device-detect';

import BrowserWrapper from './components/BrowserWrapper';
import BrowserLobby from './components/BrowserLobby';
import BrowserBoard from './components/BrowserBoard';
import BrowserClue from './components/BrowserClue';
import BrowserAnswer from './components/BrowserAnswer';
import BrowserDecision from './components/BrowserDecision';
import BrowserScoreboard from './components/BrowserScoreboard';

import MobileWrapper from './components/MobileWrapper';
import MobileLobby from './components/MobileLobby';
import MobileBoard from './components/MobileBoard';
import MobileClue from './components/MobileClue';
import MobileAnswer from './components/MobileAnswer';
import MobileDecision from './components/MobileDecision';
import MobileScoreboard from './components/MobileScoreboard';

import 'bootstrap/dist/css/bootstrap.min.css';
import './stylesheets/Game.css';

import { GameState } from './constants/GameState';
import { SocketContext, socket } from './context/socket';

const Game = () => {
    const [gameState, setGameState] = useState(GameState.LOBBY);
    const [gameStateAck, setGameStateAck] = useState(() => () => {});

    useEffect(() => {
        socket.onAny((eventName, ...args) => {
            console.log(`Heard ${eventName} with args ${args}`);
        });

        socket.on('set_game_state', (newGameState, ack) => {
            setGameState(newGameState);
            setGameStateAck(() => ack());
        });
    }, []);

    useEffect(() => {
        gameStateAck && gameStateAck();
        setGameStateAck(() => () => {});
    }, [gameState]);

    let browserView = null;
    let mobileView = null;

    switch (gameState) {
        case GameState.LOBBY:
            browserView = <BrowserLobby />;
            mobileView = <MobileLobby />;
            break;
        case GameState.BOARD:
            browserView = <BrowserBoard />;
            mobileView = <MobileBoard />;
            break;
        case GameState.CLUE:
            browserView = <BrowserClue />;
            mobileView = <MobileClue />;
            break;
        case GameState.ANSWER:
            browserView = <BrowserAnswer />;
            mobileView = <MobileAnswer />;
            break;
        case GameState.DECISION:
            browserView = <BrowserDecision />;
            mobileView = <MobileDecision />;
            break;
        case GameState.SCOREBOARD:
            browserView = <BrowserScoreboard />;
            mobileView = <MobileScoreboard />;
            break;
        default:
            browserView = <BrowserLobby />;
            mobileView = <MobileLobby />;
            break;
    }

    return (
        <SocketContext.Provider value={socket}>
            <BrowserView>
                <BrowserWrapper>
                    {browserView}
                </BrowserWrapper>
            </BrowserView>

            <MobileView>
                <MobileWrapper>
                    {mobileView}
                </MobileWrapper>
            </MobileView>
        </SocketContext.Provider>
    );
};

export default Game;
