import React, { useState, useEffect } from 'react';
import {BrowserView, MobileView} from 'react-device-detect';

import BrowserBoard from './components/BrowserBoard';
import BrowserLobby from './components/BrowserLobby';

import MobileWrapper from "./components/MobileWrapper";
import MobileBoard from './components/MobileBoard';
import MobileLobby from './components/MobileLobby';

import { GameState } from './constants/GameState';
import { sampleCategories } from './constants/sampleCategories';
import {SocketContext, socket} from './context/socket';

import 'bootstrap/dist/css/bootstrap.min.css';
import './stylesheets/Game.css';
import BrowserClue from "./components/BrowserClue";
import MobileClue from "./components/MobileClue";
import BrowserAnswer from "./components/BrowserAnswer";
import MobileAnswer from "./components/MobileAnswer";

const Game = () => {
    // TODO: Make sure this is initialized to GameState.LOBBY
    const [gameState, setGameState] = useState(GameState.LOBBY);
    const [categories, setCategories] = useState(sampleCategories);

    useEffect(() => {
        // socket.onAny((event, ...args) => {
        //     console.log(`Heard (${event})`);
        // });

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
