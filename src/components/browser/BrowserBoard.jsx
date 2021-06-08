import React, { useState, useContext, useEffect} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';

import styled from 'styled-components';
import mixins from '../../helpers/mixins';

import { sampleCategories } from '../../constants/sampleCategories';

const BoardRow = styled(Row)`
    height: calc(100vh / 6);
`;

const CategoryText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const DollarSignText = styled.span`
    font-size: 0.8em;
    display: inline-block;
    vertical-align: middle;

    padding-bottom: 0.15em;
    padding-right: 0.05em;
`;

const PriceText = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const CategoryRow = styled(BoardRow)`
    ${CategoryText}
`;

const PriceRow = styled(BoardRow)`
    ${PriceText}
`;

const FitTextWrapper = styled.div`
    height: 100%;
    ${mixins.flexAlignCenter}
`;

const CategoryCol = styled(Col)`
    line-height: 3em;

    color: black;
    border-width: 0.2em;
    border-style: solid;
    border-bottom-width: 0.4em;
`;

const PriceCol = styled(Col)`
    vertical-align: middle;
    color: black;
    border-width: 0.2em;
    border-style: solid;
`;

const BrowserBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    const [categories, setCategories] = useState(sampleCategories);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });
    }, []);

    let categoryTitleRow = categories && categories.map((category) => {
        let categoryTitle = category.title;

        return (
            <CategoryCol lg={'2'}>
                <FitTextWrapper>
                    <FitText compressor={0.5}>
                        <CategoryText>{category && category.completed ? '' : categoryTitle.toUpperCase()}</CategoryText>
                    </FitText>
                </FitTextWrapper>
            </CategoryCol>
        );
    });

    let priceRows = Array.from(Array(NUM_CLUES).keys()).map((j) => {
        let dollarValue = 200 * (j + 1);

        let priceCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            let clue = categories && categories[i].clues[j];

            return (
                <PriceCol lg={'2'}>
                    <FitTextWrapper>
                        <FitText compressor={0.3}>
                            {clue && clue.completed ? '' :
                                <PriceText>
                                    <DollarSignText>$</DollarSignText>{dollarValue}
                                </PriceText>
                            }
                        </FitText>
                    </FitTextWrapper>
                </PriceCol>
            );
        });

        return (
            <PriceRow>
                {priceCols}
            </PriceRow>
        );
    });

    return (
        <Container fluid>
            <CategoryRow>
                {categoryTitleRow}
            </CategoryRow>

            {priceRows}
        </Container>
    );
};

export default BrowserBoard;
