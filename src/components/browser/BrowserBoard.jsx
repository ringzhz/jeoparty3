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
import starBackgroundImage from '../../assets/images/starBackground.png';
import BrowserClue from './BrowserClue';
import { revealBoard, revealCategories } from '../../helpers/reveal';

import { sayJeopartyRoundFiller, sayBoardControllerNameFiller } from '../../helpers/sayFiller';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getCategoryNameCompressor = (textLength, reveal) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = reveal ? 1 : 0.75;
    } else if (textLength > 10) {
        compressor = reveal ? 0.75 : 0.5;
    } else {
        compressor = reveal ? 0.5 : 0.5;
    }

    return compressor;
};

const getCategoryNameLineHeight = (textLength) => {
    let lineHeight = null;

    if (textLength > 20) {
        lineHeight = '1.5em';
    } else if (textLength > 10) {
        lineHeight = '2em';
    } else {
        lineHeight = '2.5em';
    }

    return lineHeight;
};

const CategoryRevealWrapper = styled.div`
    display: flex;
    flex-direction: row;
    position: absolute;
    z-index: 2;
    
    left: ${props => `-${props.categoryRevealIndex * 100}vw`};
    opacity: ${props => props.showCategoryReveal ? 1 : 0};
    
    transition: left 1s linear, opacity 1s;
`;

const CategoryRevealPanel = styled.div`
    ${mixins.flexAlignCenter};
    height: 100vh;
    width: 100vw;
    z-index: 2;
    
    background-image: url(${backgroundImage});
    
    color: black;
    border-width: 2em;
    border-style: solid;
    
    line-height: 1;
`;

const CategoryRevealLogoPanel = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    height: 100vh;
    width: 100vw;
    z-index: 3;
    
    background-image: url(${starBackgroundImage});
    background-size: cover;
    opacity: ${props => props.reveal ? 0 : 1};
    transition-property: opacity;
    transition-duration: 0.5s;
    transition-timing-function: linear;
    
    color: black;
    border-width: 2em;
    border-style: solid;
`;

const CategoryRevealLogoText = styled.span`
    color: white;
    font-family: logo, serif;
    font-size: 36vh;
    text-shadow: 0.05em 0.05em #000;
`;

const CategoryRevealText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.075em 0.075em #000;
`;

const BrowserBoardContainer = styled(Container)`
    padding-left: 0 !important;
    padding-right: 0 !important;
`;

const BoardRow = styled(Row)`
    height: calc(100vh / 6);
`;

const CategoryText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const DollarValueTextWrapper = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const CategoryRow = styled(BoardRow)`
    ${CategoryText}
`;

const BoardRevealBackground = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    height: calc(500vh / 6);
    width: 100vw;
    z-index: 0;
    
    font-family: logo, serif;
    font-size: 36vh;
    text-shadow: 0.05em 0.05em #000;
    
    background-image: url(${starBackgroundImage});
    background-size: cover;
`;

const DollarValueRow = styled(BoardRow)`
    ${DollarValueText}
`;

const FitTextWrapper = styled.div`
    ${mixins.flexAlignCenter}
    height: 100%;
`;

const CategoryCol = styled(Col)`
    line-height: ${props => props.lineHeight};

    color: black;
    border-width: 0.2em;
    border-style: solid;
    border-bottom-width: 0.4em;
    
    max-height: 100%;
    
    &.board-reveal {
        ${mixins.flexAlignCenter}
        background-image: url(${starBackgroundImage});
        background-size: cover;
    }
`;

const CategoryColLogoText = styled.span`
    font-family: logo, serif;
    font-size: 6vh;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const DollarValueCol = styled(Col)`
    max-height: 100%;
    vertical-align: middle;
    
    color: black;
    border-width: 0.2em;
    border-style: solid;
    
    background-image: ${props => props.revealed ? `url(${backgroundImage})` : 'none'};
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
    // const [boardRevealed, setBoardRevealed] = useState(false);
    // const [boardRevealMatrix, setBoardRevealMatrix] = useState([
    //     [false, false, false, false, false],
    //     [false, false, false, false, false],
    //     [false, false, false, false, false],
    //     [false, false, false, false, false],
    //     [false, false, false, false, false],
    //     [false, false, false, false, false]
    // ]);
    // const [showCategoryReveal, setShowCategoryReveal] = useState(false);
    // const [categoryRevealIndex, setCategoryRevealIndex] = useState(0);
    // const [categoryPanelIndex, setCategoryPanelIndex] = useState(-1);

    const [animateClue, setAnimateClue] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const [boardRevealed, setBoardRevealed] = useState(false);
    const [boardRevealMatrix, setBoardRevealMatrix] = useState([
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ]);
    const [showCategoryReveal, setShowCategoryReveal] = useState(false);
    const [categoryRevealIndex, setCategoryRevealIndex] = useState(0);
    const [categoryPanelIndex, setCategoryPanelIndex] = useState(-1);

    const socket = useContext(SocketContext);

    const reveal = (categories, boardControllerName) => {
        revealBoard(setBoardRevealMatrix, () => {
            setTimeout(() => {
                setShowCategoryReveal(true);

                setTimeout(() => {
                    revealCategories(categories, setCategoryPanelIndex, setCategoryRevealIndex, () => {
                        setShowCategoryReveal(false);
                        setBoardRevealed(true);
                        socket.emit('board_revealed');

                        setTimeout(() => {
                            sayJeopartyRoundFiller(boardControllerName);
                        }, 1000);
                    });
                }, 1000);
            }, 1000);
        });
    };

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('board_controller_name', (boardControllerName, boardRevealed, categories) => {
            if (boardRevealed) {
                setBoardRevealed(true);
                setBoardRevealMatrix([
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true]
                ]);
                sayBoardControllerNameFiller(boardControllerName);
            } else {
                reveal(categories, boardControllerName);
            }
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
            reveal(categories, 'Isaac');
        }
    };

    const categoryRevealPanels = categories && Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        const category = categories[i];
        const categoryName = _.get(category, 'title');
        const categoryNameLength = _.size(categoryName) || 0;
        const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength, true);

        return (
            <div>
                <CategoryRevealLogoPanel reveal={categoryPanelIndex === i}>
                    <CategoryRevealLogoText>
                        JEOPARTY!
                    </CategoryRevealLogoText>
                </CategoryRevealLogoPanel>

                <CategoryRevealPanel>
                    <FitText compressor={categoryNameCompressor}>
                        <CategoryRevealText>
                            {_.invoke(categoryName, 'toUpperCase')}
                        </CategoryRevealText>
                    </FitText>
                </CategoryRevealPanel>
            </div>
        );
    });

    const categoryTitleRow = categories && categories.map((category) => {
        const categoryName = _.get(category, 'title');
        const categoryNameLength = _.size(categoryName) || 0;
        const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength, false);
        const categoryNameLineHeight = getCategoryNameLineHeight(categoryNameLength);

        let categoryCol = null;

        if (boardRevealed) {
            categoryCol = (
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
        } else {
            categoryCol = (
                <CategoryCol lineHeight={categoryNameLineHeight} lg={'2'} className={'board-reveal'}>
                    <CategoryColLogoText>
                        JEOPARTY!
                    </CategoryColLogoText>
                </CategoryCol>
            );
        }

        return categoryCol;
    });

    const dollarValueRows = categories && Array.from(Array(NUM_CLUES).keys()).map((j) => {
        const dollarValue = 200 * (j + 1);

        const dollarValueCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            const clue = _.get(categories, `[${i}].clues[${j}]`);
            const revealed = boardRevealMatrix[i][j];

            return (
                <DollarValueCol lg={'2'} revealed={revealed}>
                    <FitTextWrapper>
                        <FitText compressor={0.3}>
                            {_.get(clue, 'completed') || !revealed ? '' :
                                <DollarValueTextWrapper>
                                    <DollarValueText dollarValue={dollarValue} />
                                </DollarValueTextWrapper>
                            }
                        </FitText>
                    </FitTextWrapper>
                </DollarValueCol>
            );
        });

        return (
            <DollarValueRow>
                {dollarValueCols}
            </DollarValueRow>
        );
    });

    return (
        <div>
            <CategoryRevealWrapper showCategoryReveal={showCategoryReveal} categoryRevealIndex={categoryRevealIndex}>
                {categoryRevealPanels}
            </CategoryRevealWrapper>

            <BrowserBoardContainer fluid>
                <CategoryRow>
                    {categoryTitleRow}
                </CategoryRow>

                <ClueWrapper className={animateClue && 'animate'}
                             categoryIndex={categoryIndex && categoryIndex}
                             clueIndex={clueIndex && clueIndex}>
                    <BrowserClue />
                </ClueWrapper>

                {!boardRevealed && <BoardRevealBackground>JEOPARTY!</BoardRevealBackground>}

                {dollarValueRows}
            </BrowserBoardContainer>
        </div>
    );
};

export default BrowserBoard;
