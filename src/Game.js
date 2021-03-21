import React, { useState, useEffect } from 'react';
import { BrowserView, MobileView } from 'react-device-detect';

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
import { sampleCategories } from './constants/sampleCategories';
import { SocketContext, socket } from './context/socket';

const Game = () => {
    const [gameState, setGameState] = useState(GameState.LOBBY);
    const [categories, setCategories] = useState(sampleCategories);

    useEffect(() => {
        socket.on('set_game_state', (newGameState) => {
            setGameState(newGameState);
        });

        socket.on('categories', (categories) => {
            setCategories(categories);
        });
    }, []);

    let browserView = null;
    let mobileView = null;

    switch (gameState) {
        case GameState.LOBBY:
            browserView = <BrowserLobby />;
            mobileView = <MobileLobby />;
            break;
        case GameState.BOARD:
            browserView = <BrowserBoard categories={categories} />;
            mobileView = <MobileBoard categories={categories} />;
            break;
        case GameState.CLUE:
            browserView = <BrowserClue categories={categories} />;
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
                {browserView}
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
