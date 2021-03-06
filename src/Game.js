import React, { useState } from 'react';
import {BrowserView, MobileView} from 'react-device-detect';

import BrowserBoard from './components/BrowserBoard';
import BrowserLobby from './components/BrowserLobby';

import MobileWrapper from "./components/MobileWrapper";
import MobileBoard from './components/MobileBoard';
import MobileLobby from './components/MobileLobby';

import 'bootstrap/dist/css/bootstrap.min.css';

import { GameState } from './constants/GameState';
import {SocketContext, socket} from './context/socket';

const Game = () => {
    const [gameState, setGameState] = useState(GameState.LOBBY);

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
