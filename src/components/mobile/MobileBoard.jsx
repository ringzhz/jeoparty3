import React, { useState, useCallback, useContext, useEffect } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import MobileWait from '../../helpers/components/MobileWait';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getCategoryTextCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = 1.5;
    } else if (textLength > 10) {
        compressor = 1.25;
    } else {
        compressor = 1;
    }

    return compressor;
};

const MobileBoardContainer = styled(Container)`
    padding: 0;
`;

const CategoryRow = styled(Row)`
    ${mixins.flexAlignCenter}
    height: calc(100vh / 6);
    height: calc(var(--vh, 1vh) * ${100 / 6});
`;

const CategoryCol = styled(Col)`
    ${mixins.flexAlignCenter}
    color: black;
    border-width: 0.2em;
    border-style: solid;
`;

const CategoryText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const PriceRow = styled(Row)`
    ${mixins.flexAlignCenter}
    height: 20vh;
    height: calc(var(--vh, 1vh) * 20);
`;

const PriceCol = styled(Col)`
    ${mixins.flexAlignCenter}
    color: black;
    border-width: 0.2em;
    border-style: solid;
`;

const PriceText = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const MobileBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    // DEBUG
    // const [categories, setCategories] = useState(sampleCategories);
    // const [isBoardController, setIsBoardController] = useState(false);
    // const [categoryIndex, setCategoryIndex] = useState(null);
    // const [player, setPlayer] = useState({name: 'Isaac', score: -69000});

    const [categories, setCategories] = useState([]);
    const [isBoardController, setIsBoardController] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [player, setPlayer] = useState({});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('is_board_controller', (isBoardController) => {
            setIsBoardController(isBoardController);
        });

        socket.on('player', (player) => {
            setPlayer(player);
        });
    }, []);

    const handleSelectCategory = useCallback((categoryIndex) => {
        setCategoryIndex(categoryIndex);
    }, []);

    const handleRequestClue = useCallback((categoryIndex, clueIndex) => {
        socket.emit('request_clue', categoryIndex, clueIndex);
    }, []);

    let categoryRows = categories && Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        const category = categories[i];
        const categoryTitle = _.get(category, 'title');

        return (
            <CategoryRow onClick={() => handleSelectCategory(i)}>
                <CategoryCol>
                    <FitText compressor={categoryTitle ? getCategoryTextCompressor(categoryTitle.length) : 0}>
                        <CategoryText>
                            {_.get(category, 'completed') ? '' : categoryTitle && categoryTitle.toUpperCase()}
                        </CategoryText>
                    </FitText>
                </CategoryCol>
            </CategoryRow>
        );
    });

    let priceRows = categories && Array.from(Array(NUM_CLUES).keys()).map((i) => {
        const clue = categoryIndex !== null && categories && categories[categoryIndex] && categories[categoryIndex].clues[i];
        const dollarValue = 200 * (i + 1);

        return (
            <PriceRow onClick={() => {
                if (categories && !categories[categoryIndex].clues[i].completed) {
                    handleRequestClue(categoryIndex, i);
                }
            }}>
                <PriceCol>
                    <FitText compressor={0.5}>
                        {_.get(clue, 'completed') ? '' :
                            <PriceText>
                                <DollarValueText dollarValue={dollarValue} />
                            </PriceText>
                        }
                    </FitText>
                </PriceCol>
            </PriceRow>
        );
    });

    let rows = null;

    if (categoryIndex === null) {
        rows = categoryRows;
    } else {
        rows = priceRows;
    }

    return (
        <MobileBoardContainer fluid>
            {
                isBoardController && (
                    <div>
                        {rows}
                    </div>
                )
            }

            {
                !isBoardController && (
                    <div>
                        <MobileWait player={player} />
                    </div>
                )
            }
        </MobileBoardContainer>
    );
};

export default MobileBoard;
