import React, { useState, useEffect } from 'react';
import { BrowserView, MobileView } from 'react-device-detect';

import BrowserWrapper from './components/browser/BrowserWrapper';
import BrowserLobby from './components/browser/BrowserLobby';
import BrowserBoard from './components/browser/BrowserBoard';
import BrowserClue from './components/browser/BrowserClue';
import BrowserAnswer from './components/browser/BrowserAnswer';
import BrowserDecision from './components/browser/BrowserDecision';
import BrowserScoreboard from './components/browser/BrowserScoreboard';

import MobileWrapper from './components/mobile/MobileWrapper';
import MobileLobby from './components/mobile/MobileLobby';
import MobileBoard from './components/mobile/MobileBoard';
import MobileClue from './components/mobile/MobileClue';
import MobileAnswer from './components/mobile/MobileAnswer';
import MobileDecision from './components/mobile/MobileDecision';
import MobileScoreboard from './components/mobile/MobileScoreboard';

import { GameState } from './constants/GameState';
import { SocketContext, socket } from './context/socket';

import 'bootstrap/dist/css/bootstrap.min.css';

import { createGlobalStyle } from 'styled-components';
import backgroundImage from './assets/images/background.png';
import logoFont from './assets/fonts/logo.ttf';
import clueFont from './assets/fonts/clue.otf';
import boardFont from './assets/fonts/board.otf';

const GlobalStyle = createGlobalStyle`
    body {
        overflow: hidden;
        background-image: url(${backgroundImage});
        color: white !important;
        text-align: center;
    
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    
    @font-face {
        font-family: logo;
        src: url(${logoFont});
    }
    
    @font-face {
        font-family: clue;
        src: url(${clueFont});
    }
    
    @font-face {
        font-family: board;
        src: url(${boardFont});
    }
`;

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
            <GlobalStyle />
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
