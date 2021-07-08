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

import { sayBoardControllerNameFiller } from '../../helpers/sayFiller';
import say from '../../helpers/say';

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
    transition-property: left;
    transition-duration: 1s;
    transition-timing-function: linear;
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

const DollarValueRow = styled(BoardRow)`
    ${DollarValueText}
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

const DollarValueCol = styled(Col)`
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
    const [animateClue, setAnimateClue] = useState(false);
    const [categories, setCategories] = useState(sampleCategories);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [clueIndex, setClueIndex] = useState(1);
    const [categoryRevealIndex, setCategoryRevealIndex] = useState(0);
    const [categoryPanelIndex, setCategoryPanelIndex] = useState(-1);

    // const [animateClue, setAnimateClue] = useState(false);
    // const [categories, setCategories] = useState([]);
    // const [categoryIndex, setCategoryIndex] = useState(null);
    // const [clueIndex, setClueIndex] = useState(null);
    // const [categoryRevealIndex, setCategoryRevealIndex] = useState(0);

    const socket = useContext(SocketContext);

    const revealCategories = () => {
        say('Here are the categories...', () => {
            setCategoryPanelIndex(0);

            setTimeout(() => {
                say(_.get(categories, '[0].title'), () => {
                    setCategoryRevealIndex(1);

                    setTimeout(() => {
                        setCategoryPanelIndex(1);

                        setTimeout(() => {
                            say(_.get(categories, '[1].title'), () => {
                                setCategoryRevealIndex(2);

                                setTimeout(() => {
                                    setCategoryPanelIndex(2);

                                    setTimeout(() => {
                                        say(_.get(categories, '[2].title'), () => {
                                            setCategoryRevealIndex(3);

                                            setTimeout(() => {
                                                setCategoryPanelIndex(3);

                                                setTimeout(() => {
                                                    say(_.get(categories, '[3].title'), () => {
                                                        setCategoryRevealIndex(4);

                                                        setTimeout(() => {
                                                            setCategoryPanelIndex(4);

                                                            setTimeout(() => {
                                                                say(_.get(categories, '[4].title'), () => {
                                                                    setCategoryRevealIndex(5);

                                                                    setTimeout(() => {
                                                                        setCategoryPanelIndex(5);

                                                                        setTimeout(() => {
                                                                            say(`and ${_.get(categories, '[5].title')}`, () => {
                                                                                setCategoryRevealIndex(6);
                                                                            });
                                                                        }, 500);
                                                                    }, 1000);
                                                                });
                                                            }, 500);
                                                        }, 1000);
                                                    });
                                                }, 500);
                                            }, 1000);
                                        });
                                    }, 500);
                                }, 1000);
                            });
                        }, 500);
                    }, 1000);
                });
            }, 500);
        });
    };

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('board_controller_name', (boardControllerName) => {
            sayBoardControllerNameFiller(boardControllerName);
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
            revealCategories();
        }
    };

    const categoryRevealPanels = categories && Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        const category = categories[i];
        const categoryName = _.get(category, 'title');

        return (
            <div>
                <CategoryRevealLogoPanel reveal={categoryPanelIndex === i}>
                    <CategoryRevealLogoText>
                        JEOPARTY!
                    </CategoryRevealLogoText>
                </CategoryRevealLogoPanel>

                <CategoryRevealPanel>
                    <FitText compressor={1}>
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

    const dollarValueRows = categories && Array.from(Array(NUM_CLUES).keys()).map((j) => {
        const dollarValue = 200 * (j + 1);

        const dollarValueCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            const clue = _.get(categories, `[${i}].clues[${j}]`);

            return (
                <DollarValueCol lg={'2'}>
                    <FitTextWrapper>
                        <FitText compressor={0.3}>
                            {_.get(clue, 'completed') ? '' :
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
            <CategoryRevealWrapper categoryRevealIndex={categoryRevealIndex}>
                {categoryRevealPanels}
            </CategoryRevealWrapper>

            <Container fluid>
                <CategoryRow>
                    {categoryTitleRow}
                </CategoryRow>

                <ClueWrapper className={animateClue && 'animate'}
                             categoryIndex={categoryIndex && categoryIndex}
                             clueIndex={clueIndex && clueIndex}>
                    <BrowserClue />
                </ClueWrapper>

                {dollarValueRows}
            </Container>
        </div>
    );
};

export default BrowserBoard;
