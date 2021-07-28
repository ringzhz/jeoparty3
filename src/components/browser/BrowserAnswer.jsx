import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import { timers } from '../../constants/timers';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import starBackgroundImage from '../../assets/images/starBackground.png';
import Timer from '../../helpers/components/Timer';

import buzzInSound from '../../assets/audio/buzzIn.mp3';

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

const CategoryTextPanel = styled.div`
    ${mixins.flexAlignCenter};
    height: 100%;
`;

const CategoryText = styled.span`
    display: block;
    
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
    line-height: 1;
    letter-spacing: 0.025em;
`;

const DollarValueTextPanel = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    transform: translateX(-50%);
    left: 50%;
    bottom: -10%;
`;

const DollarValueTextWrapper = styled.span`
    font-size: 10vh;
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const PlayerNameText = styled.span`
    font-size: 5vh;
    font-family: clue, serif;
    text-shadow: 0.1em 0.1em #000;
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
    // const [dollarValue, setDollarValue] = useState(0);
    // const [playerName, setPlayerName] = useState('luffy');
    // const [answerLivefeed, setAnswerLivefeed] = useState('led ze');
    // const [startTimer, setStartTimer] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(0);
    const [dollarValue, setDollarValue] = useState(0);
    const [playerName, setPlayerName] = useState('');
    const [answerLivefeed, setAnswerLivefeed] = useState('');
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('request_clue', (categoryIndex, clueIndex, dollarValue) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);
            setDollarValue(dollarValue);
        });

        socket.on('buzz_in', (dailyDouble) => {
            if (!dailyDouble) {
                const buzzInAudio = new Audio(buzzInSound);
                buzzInAudio.play();
            }
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

    const categoryName = _.get(categories, `[${categoryIndex}].title`);
    const categoryNameLength = _.size(categoryName) || 0;
    const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength);

    const clueText = _.get(categories, `[${categoryIndex}].clues[${clueIndex}].question`);
    const clueTextLength = _.size(clueText) || 0;
    const clueTextCompressor = getClueTextCompressor(clueTextLength);

    return (
        <Container fluid>
            <ClueRow>
                <PanelCol lg={'6'}>
                    <CategoryPanel>
                        <CategoryTextPanel>
                            {_.get(categories, `[0].title`) && (
                                <FitText compressor={categoryNameCompressor}>
                                    <CategoryText>
                                        {_.invoke(categoryName, 'toUpperCase')}
                                    </CategoryText>
                                </FitText>
                            )}
                        </CategoryTextPanel>

                        <DollarValueTextPanel>
                            <DollarValueTextWrapper>
                                <DollarValueText dollarValue={dollarValue} />
                            </DollarValueTextWrapper>
                        </DollarValueTextPanel>
                    </CategoryPanel>
                </PanelCol>

                <PanelCol lg={'6'}>
                    <CluePanel>
                        {_.get(categories, `[0].title`) && (
                            <FitText compressor={clueTextCompressor}>
                                {_.invoke(clueText, 'toUpperCase')}
                            </FitText>
                        )}
                    </CluePanel>

                    <Timer override={{ position: 'absolute', left: '25%', bottom: '0' }} height={'5%'} width={'50%'} start={startTimer} time={timers.ANSWER_TIMEOUT} slideUp={false} />
                </PanelCol>
            </ClueRow>

            <LivefeedRow>
                <PanelCol lg={'12'}>
                    <PlayerNameText>{_.invoke(playerName, 'toUpperCase')}</PlayerNameText>
                    <LivefeedPanel>
                        <FitText compressor={1.5}>
                            {_.isEmpty(answerLivefeed) ? <span>&nbsp;</span> : _.invoke(answerLivefeed, 'toUpperCase')}
                        </FitText>
                    </LivefeedPanel>
                </PanelCol>
            </LivefeedRow>
        </Container>
    );
};

export default BrowserAnswer;

