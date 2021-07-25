import React, { useState, useContext, useEffect } from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { SocketContext } from '../../context/socket';

import { sayWagerFiller } from '../../helpers/sayFiller';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';
import { samplePlayers } from '../../constants/samplePlayers';

const BrowserWager = () => {
    // DEBUG
    const [categories, setCategories] = useState(sampleCategories);
    const [doubleJeoparty, setDoubleJeoparty] = useState(true);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [clueIndex, setClueIndex] = useState(0);
    const [boardController, setBoardController] = useState(samplePlayers['zsS3DKSSIUOegOQuAAAA']);

    // const [player, setPlayer] = useState({});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories, doubleJeoparty) => {
            setCategories(categories);
            setDoubleJeoparty(doubleJeoparty);
        });

        socket.on('request_clue', (categoryIndex, clueIndex) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);
        });

        socket.on('board_controller', (boardController) => {
            setBoardController(boardController);

            const score = _.get(boardController, 'score');
            sayWagerFiller(Math.min(0, score), Math.max(score, doubleJeoparty ? 2000 : 1000));
        });
    });

    // DEBUG
    document.body.onkeyup = (e) => {
        if (e.keyCode === 32) {
            const score = _.get(boardController, 'score');
            sayWagerFiller(Math.min(0, score), Math.max(score, doubleJeoparty ? 2000 : 1000));
        }
    };

    return (
        <div>
        </div>
    );
};

export default BrowserWager;
