import React, { useState } from "react";
import {BrowserView, MobileView} from 'react-device-detect';

import BrowserBoard from "./components/BrowserBoard";
import BrowserLobby from "./components/BrowserLobby";

import MobileBoard from "./components/MobileBoard";
import MobileLobby from "./components/MobileLobby";

import 'bootstrap/dist/css/bootstrap.min.css';

import { GameState } from './constants';
import {SocketContext, socket} from './context/socket';

const Game = () => {
    const [gameState, setGameState] = useState(GameState.BOARD);

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
                {mobileView}
            </MobileView>
        </SocketContext.Provider>
    );
};

export default Game;
