import React, { useContext, useEffect, useState } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import { timers } from '../../constants/timers';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import starBackgroundImage from '../../assets/images/star-background.png';
import Timer from '../../helpers/components/Timer';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getCategoryTextCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = 1;
    } else if (textLength > 10) {
        compressor = 0.75;
    } else {
        compressor = 0.5;
    }

    return compressor;
};

const getCategoryTextLineHeight = (textLength) => {
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

const getClueTextCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 200) {
        compressor = 2;
    } else if (textLength > 100) {
        compressor = 1.75;
    } else {
        compressor = 1.5;
    }

    return compressor;
};

const ClueRow = styled(Row)`
    height: 60vh;
`;

const LivefeedRow = styled(Row)`
    height: 40vh;
    display: flex;
    align-items: center;
`;

const PanelCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const CluePanel = styled.div`
    margin-left: 10%;
    height: 75%;
    width: 80%;
    border: 0.3em solid black;
    box-shadow: 0.5em 0.5em black;
    
    ${mixins.flexAlignCenter}
    
    padding-left: 5em !important;
    padding-right: 5em !important;
    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.25em 0.25em #000;
    background-image: url(${starBackgroundImage});
    background-size: cover;
`;

const CategoryPanel = styled(CluePanel)`
    letter-spacing: 0.1em;
    background-image: none;
`;

const CategoryText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
    line-height: ${props => getCategoryTextLineHeight(props.textLength)};
`;

const PriceText = styled.span`
    font-size: 10vh;
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const PlayerNameText = styled.span`
    font-size: 5vh;
    font-family: clue, serif;
    text-shadow: 0.15em 0.15em #000;
`;

const LivefeedPanel = styled.div`
    margin-left: 5%;
    height: 25%;
    width: 90%;
    border: 0.3em solid black;
    box-shadow: 0.5em 0.5em black;
    
    ${mixins.flexAlignCenter}
    
    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.35em 0.35em #000;
    
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const BrowserAnswer = () => {
    // DEBUG
    // const [categories, setCategories] = useState(sampleCategories);
    // const [categoryIndex, setCategoryIndex] = useState(0);
    // const [clueIndex, setClueIndex] = useState(0);
    // const [playerName, setPlayerName] = useState('luffy');
    // const [answerLivefeed, setAnswerLivefeed] = useState('led ze');
    // const [startTimer, setStartTimer] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [answerLivefeed, setAnswerLivefeed] = useState('');
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('request_clue', (categoryIndex, clueIndex) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);
        });

        socket.on('player_name', (playerName) => {
            setPlayerName(playerName);
        });

        socket.on('answer_livefeed', (answerLivefeed) => {
            setAnswerLivefeed(answerLivefeed);
        });

        setTimeout(() => {
            setStartTimer(true);
        }, 100);
    }, []);

    return (
        <Container fluid>
            <ClueRow>
                <PanelCol lg={'6'}>
                    <CategoryPanel>
                        <FitText compressor={getCategoryTextCompressor((categoryIndex !== null) ? categories[categoryIndex].title.length : 0)}>
                            <CategoryText textLength={(categoryIndex !== null) ? categories[categoryIndex].title.length : 0}>
                                {(categoryIndex !== null) && (
                                    categories[categoryIndex].title.toUpperCase()
                                )}
                            </CategoryText>
                        </FitText>
                        <PriceText>
                            <DollarValueText dollarValue={(categoryIndex !== null && clueIndex !== null) && (200 * (clueIndex + 1))} />
                        </PriceText>
                    </CategoryPanel>
                </PanelCol>

                <PanelCol lg={'6'}>
                    <CluePanel>
                        <FitText compressor={getClueTextCompressor((categoryIndex !== null && clueIndex !== null) ? categories[categoryIndex].clues[clueIndex].question.length : 0)}>
                            {(categoryIndex !== null && clueIndex !== null) && (
                                categories[categoryIndex].clues[clueIndex].question.toUpperCase()
                            )}
                        </FitText>
                    </CluePanel>

                    <Timer override={{ position: 'absolute', left: '25%', bottom: '0' }} height={'5%'} width={'50%'} start={startTimer} time={timers.ANSWER_TIMEOUT} slideUp={false} />
                </PanelCol>
            </ClueRow>

            <LivefeedRow>
                <PanelCol lg={'12'}>
                    <PlayerNameText>{playerName.toUpperCase()}</PlayerNameText>
                    <LivefeedPanel>
                        <FitText compressor={1.5}>
                            {answerLivefeed.length > 0 ? answerLivefeed.toUpperCase() : <span>&nbsp;</span>}
                        </FitText>
                    </LivefeedPanel>
                </PanelCol>
            </LivefeedRow>
        </Container>
    );
};

export default BrowserAnswer;

