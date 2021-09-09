import React, { useState, useEffect } from 'react';
import { BrowserView, MobileView } from 'react-device-detect';

import { createGlobalStyle } from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

import BrowserWrapper from './components/browser/BrowserWrapper';
import BrowserLobby from './components/browser/BrowserLobby';
import BrowserBoard from './components/browser/BrowserBoard';
import BrowserWager from './components/browser/BrowserWager';
import BrowserClue from './components/browser/BrowserClue';
import BrowserAnswer from './components/browser/BrowserAnswer';
import BrowserDecision from './components/browser/BrowserDecision';
import BrowserScoreboard from './components/browser/BrowserScoreboard';

import MobileWrapper from './components/mobile/MobileWrapper';
import MobileLobby from './components/mobile/MobileLobby';
import MobileBoard from './components/mobile/MobileBoard';
import MobileWager from './components/mobile/MobileWager';
import MobileClue from './components/mobile/MobileClue';
import MobileAnswer from './components/mobile/MobileAnswer';
import MobileDecision from './components/mobile/MobileDecision';
import MobileScoreboard from './components/mobile/MobileScoreboard';

import { GameState } from './constants/GameState';
import { CookiesProvider } from 'react-cookie';
import { SocketContext, socket } from './context/socket';
import { DebugContext } from './context/debug';

import backgroundImage from './assets/images/background.png';
import logoFont from './assets/fonts/logo.ttf';
import clueFont from './assets/fonts/clue.otf';
import boardFont from './assets/fonts/board.otf';
import dailyDoubleFont from './assets/fonts/dailyDouble.ttf';
import BrowserPodium from "./components/browser/BrowserPodium";
import MobilePodium from "./components/mobile/MobilePodium";

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
    
    @font-face {
        font-family: dailyDouble;
        src: url(${dailyDoubleFont});
    }
    
    @keyframes rainbow {
      0% {
        color: #e6261f;
      }
    
      12.5% {
        color: #eb7532;
      }
      25% {
        color: #f7d038;
      }
      37.5% {
        color: #a3e048;
      }
      50% {
        color: #49da9a;
      }
      62.5% {
        color: #4355db;
      }
      75% {
        color: #d23be7;
      }
      87.5% {
        color: #ffb6c1;
      }
      100% {
        color: #e6261f;
      }
    }
    
    @keyframes move-text {
        0% { bottom: -0.2em; opacity: 1; }
        50% { bottom: 0.2em; }
        100% { bottom: 0; opacity: 1; }
    }
`;

const Game = () => {
    const debug = false;

    const [gameState, setGameState] = useState(debug ? GameState.LOBBY : GameState.LOBBY);
    const [gameStateAck, setGameStateAck] = useState(() => () => {});

    useEffect(() => {
        window.speechSynthesis.getVoices();

        socket.on('set_game_state', (newGameState, ack) => {
            setGameState(newGameState);
            setGameStateAck(() => ack());
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        gameStateAck && gameStateAck();
        setGameStateAck(() => () => {});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);

    useEffect(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // window.addEventListener('resize', () => {
        //     const vh = window.innerHeight * 0.01;
        //     document.documentElement.style.setProperty('--vh', `${vh}px`);
        // });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        case GameState.WAGER:
            browserView = <BrowserWager />;
            mobileView = <MobileWager />;
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
        case GameState.PODIUM:
            browserView = <BrowserPodium />;
            mobileView = <MobilePodium />;
            break;
        default:
            browserView = <BrowserLobby />;
            mobileView = <MobileLobby />;
            break;
    }

    return (
        <CookiesProvider>
            <DebugContext.Provider value={debug}>
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
            </DebugContext.Provider>
        </CookiesProvider>
    );
};

export default Game;
