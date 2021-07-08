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
import { samplePlayers } from '../../constants/samplePlayers';

const getCategoryNameCompressor = (textLength) => {
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

const DollarValueRow = styled(Row)`
    ${mixins.flexAlignCenter}
    height: 20vh;
    height: calc(var(--vh, 1vh) * 20);
`;

const DollarValueCol = styled(Col)`
    ${mixins.flexAlignCenter}
    color: black;
    border-width: 0.2em;
    border-style: solid;
`;

const DollarValueTextWrapper = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const MobileBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    // DEBUG
    // const [categories, setCategories] = useState(sampleCategories);
    // const [isBoardController, setIsBoardController] = useState(true);
    // const [categoryIndex, setCategoryIndex] = useState(null);
    // const [player, setPlayer] = useState(samplePlayers['zsS3DKSSIUOegOQuAAAA']);

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
        const categoryName = _.get(category, 'title');
        const categoryNameLength = _.size(categoryName) || 0;
        const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength);

        return (
            <CategoryRow onClick={() => handleSelectCategory(i)}>
                <CategoryCol>
                    <FitText compressor={categoryNameCompressor}>
                        <CategoryText>
                            {_.get(category, 'completed') ? '' : _.invoke(categoryName, 'toUpperCase')}
                        </CategoryText>
                    </FitText>
                </CategoryCol>
            </CategoryRow>
        );
    });

    let dollarValueRows = categories && Array.from(Array(NUM_CLUES).keys()).map((i) => {
        const clue = _.get(categories, `[${categoryIndex}].clues[${i}]`);
        const dollarValue = 200 * (i + 1);

        return (
            <DollarValueRow onClick={() => {
                if (!_.get(clue, 'completed')) {
                    handleRequestClue(categoryIndex, i);
                }
            }}>
                <DollarValueCol>
                    <FitText compressor={0.6}>
                        {_.get(clue, 'completed') ? '' :
                            <DollarValueTextWrapper>
                                <DollarValueText dollarValue={dollarValue} />
                            </DollarValueTextWrapper>
                        }
                    </FitText>
                </DollarValueCol>
            </DollarValueRow>
        );
    });

    let rows = null;

    if (categoryIndex === null) {
        rows = categoryRows;
    } else {
        rows = dollarValueRows;
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
