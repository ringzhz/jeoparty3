import React, { useState, useContext, useEffect} from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import backgroundImage from '../../assets/images/background.png'
import BrowserClue from './BrowserClue';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getCategoryNameCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = 0.75;
    } else if (textLength > 10) {
        compressor = 0.5;
    } else {
        compressor = 0.5;
    }

    return compressor;
};

const getCategoryNameLineHeight = (textLength) => {
    let lineHeight = null;

    if (textLength > 20) {
        lineHeight = '1.5em';
    } else if (textLength > 10) {
        lineHeight = '2.1em';
    } else {
        lineHeight = '2.5em';
    }

    return lineHeight;
};

const BoardRow = styled(Row)`
    height: calc(100vh / 6);
`;

const CategoryText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
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
    line-height: ${props => props.lineHeight};

    color: black;
    border-width: 0.2em;
    border-style: solid;
    border-bottom-width: 0.4em;
    
    max-height: 100%;
`;

const PriceCol = styled(Col)`
    vertical-align: middle;
    color: black;
    border-width: 0.2em;
    border-style: solid;
    
    max-height: 100%;
`;

const ClueWrapper = styled.div`
    background-image: url(${backgroundImage});
    position: absolute;
    z-index: 2;
    
    transform: scale(0.16);
    top: ${props => `calc(-125vh/3 + ${(props.clueIndex + 1) * 100}vh/6)`};
    left: ${props => `calc(-25vw + ${(props.categoryIndex - 1) * 100}vw/6)`};
    opacity: 0;
    
    &.animate {
        transform: scale(1);
        top: 0;
        left: 0;
        opacity: 1;
        
        transition: transform 1s, top 1s, left 1s;
    }
`;

const BrowserBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    // DEBUG
    // const [animateClue, setAnimateClue] = useState(false);
    // const [categories, setCategories] = useState(sampleCategories);
    // const [categoryIndex, setCategoryIndex] = useState(0);
    // const [clueIndex, setClueIndex] = useState(1);

    const [animateClue, setAnimateClue] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('request_clue', (categoryIndex, clueIndex) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);

            setTimeout(() => {
                setAnimateClue(true);
            }, 100);
        });
    }, []);

    // DEBUG
    document.body.onkeyup = (e) => {
        if (e.keyCode === 32) {
            setCategoryIndex(1);
            setClueIndex(1);

            setTimeout(() => {
                setAnimateClue(true);
            }, 100);
        }
    };

    let categoryTitleRow = categories && categories.map((category) => {
        const categoryName = _.get(category, 'title');
        const categoryNameLength = _.size(categoryName) || 0;
        const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength);
        const categoryNameLineHeight = getCategoryNameLineHeight(categoryNameLength);

        return (
            <CategoryCol lineHeight={categoryNameLineHeight} lg={'2'}>
                <FitTextWrapper>
                    <FitText compressor={categoryNameCompressor}>
                        <CategoryText>
                            {_.get(category, 'completed') ? '' : _.invoke(categoryName, 'toUpperCase')}
                        </CategoryText>
                    </FitText>
                </FitTextWrapper>
            </CategoryCol>
        );
    });

    const priceRows = categories && Array.from(Array(NUM_CLUES).keys()).map((j) => {
        const dollarValue = 200 * (j + 1);

        const priceCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            const clue = _.get(categories, `[${i}].clues[${j}]`);

            return (
                <PriceCol lg={'2'}>
                    <FitTextWrapper>
                        <FitText compressor={0.3}>
                            {_.get(clue, 'completed') ? '' :
                                <PriceText>
                                    <DollarValueText dollarValue={dollarValue} />
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

            <ClueWrapper className={animateClue && 'animate'}
                         categoryIndex={categoryIndex && categoryIndex}
                         clueIndex={clueIndex && clueIndex}>
                <BrowserClue />
            </ClueWrapper>

            {priceRows}
        </Container>
    );
};

export default BrowserBoard;
