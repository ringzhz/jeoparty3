import React, { useState, useCallback, useContext, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobileWait from '../../helpers/components/MobileWait';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const MobileBoardContainer = styled(Container)`
    padding: 0;
`;

const CategoryRow = styled(Row)`
    ${mixins.flexAlignCenter}
    height: calc(100vh / 6);
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
    height: calc(100vh / 5);
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
    // const [isBoardController, setIsBoardController] = useState(true);
    // const [categoryIndex, setCategoryIndex] = useState(0);

    const [categories, setCategories] = useState([]);
    const [isBoardController, setIsBoardController] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState(null);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('is_board_controller', (isBoardController) => {
            setIsBoardController(isBoardController);
        });
    }, []);

    const handleSelectCategory = useCallback((categoryIndex) => {
        setCategoryIndex(categoryIndex);
    }, []);

    const handleRequestClue = useCallback((categoryIndex, clueIndex) => {
        socket.emit('request_clue', categoryIndex, clueIndex);
    }, []);

    let categoryRows = categories && Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        let category = categories[i];
        let categoryTitle = category && category.title;

        return (
            <CategoryRow onClick={() => handleSelectCategory(i)}>
                <CategoryCol>
                    <FitText compressor={2}>
                        <CategoryText>{categoryTitle && categoryTitle.toUpperCase()}</CategoryText>
                    </FitText>
                </CategoryCol>
            </CategoryRow>
        );
    });

    let priceRows = categories && Array.from(Array(NUM_CLUES).keys()).map((i) => {
        let dollarValue = 200 * (i + 1);

        return (
            <PriceRow onClick={() => handleRequestClue(categoryIndex, i)}>
                <PriceCol>
                    <FitText compressor={1}>
                        <PriceText>${dollarValue}</PriceText>
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
                    <MobileWait />
                )
            }
        </MobileBoardContainer>
    );
};

export default MobileBoard;
