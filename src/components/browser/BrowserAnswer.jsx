import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import { timers } from '../../constants/timers';
import mixins from '../../helpers/mixins';
import DollarValueText from '../../helpers/components/DollarValueText';
import starBackgroundImage from '../../assets/images/starBackground.png';
import Timer from '../../helpers/components/Timer';

import buzzInSound from '../../assets/audio/buzzIn.mp3';
import finalJeopartyMusicSound from '../../assets/audio/finalJeopartyMusic.mp3';

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

const CategoryYearText = styled.span`
    font-size: 6vh;
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
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
    const debug = useContext(DebugContext);

    const [categoryName, setCategoryName] = useState(debug ? sampleCategories[0].title : '');
    const [categoryYear, setCategoryYear] = useState(debug ? '2000' : '');
    const [clueText, setClueText] = useState(debug ? sampleCategories[0].clues[0].question : '');
    const [dollarValue, setDollarValue] = useState(0);
    const [finalJeoparty, setFinalJeoparty] = useState(debug ? false : false);
    const [currentAnswersSubmitted, setCurrentAnswersSubmitted] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(debug ? 4 : 0);
    const [playerName, setPlayerName] = useState(debug ? 'luffy' : '');
    const [answerLivefeed, setAnswerLivefeed] = useState(debug ? 'led ze' : '');
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('request_clue', (categoryName, categoryYear, clueText, dollarValue, finalJeoparty) => {
            setCategoryName(categoryName);
            setCategoryYear(categoryYear);
            setClueText(clueText);
            setDollarValue(dollarValue);
            setFinalJeoparty(finalJeoparty);
        });

        socket.on('play_buzz_in_sound', (dailyDouble, finalJeoparty) => {
            if (!dailyDouble && !finalJeoparty) {
                const buzzInAudio = new Audio(buzzInSound);
                buzzInAudio.play();
            }

            if (finalJeoparty) {
                const finalJeopartyMusicAudio = new Audio(finalJeopartyMusicSound);
                finalJeopartyMusicAudio.play();
            }
        });

        socket.on('player_name', (playerName) => {
            setPlayerName(playerName);
        });

        socket.on('answer_livefeed', (answerLivefeed) => {
            setAnswerLivefeed(answerLivefeed);
        });

        socket.on('answers_submitted', (currentAnswersSubmitted, totalAnswers) => {
            setCurrentAnswersSubmitted(currentAnswersSubmitted);
            setTotalAnswers(totalAnswers);
        });

        setTimeout(() => {
            setStartTimer(true);
        }, 100);

        return () => {
            socket.off('play_buzz_in_sound');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categoryNameLength = _.size(categoryName) || 0;
    const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength);

    const clueTextLength = _.size(clueText) || 0;
    const clueTextCompressor = getClueTextCompressor(clueTextLength);

    return (
        <Container fluid>
            <ClueRow>
                <PanelCol lg={'6'}>
                    <CategoryPanel>
                        <CategoryTextPanel>
                            {!_.isEmpty(categoryName) && (
                                <FitText compressor={categoryNameCompressor}>
                                    <CategoryText>
                                        {_.invoke(categoryName, 'toUpperCase')}
                                    </CategoryText>
                                </FitText>
                            )}

                            <CategoryYearText>
                                {!finalJeoparty && categoryYear}
                            </CategoryYearText>
                        </CategoryTextPanel>

                        <DollarValueTextPanel>
                            <DollarValueTextWrapper>
                                {!finalJeoparty && <DollarValueText dollarValue={dollarValue} />}
                            </DollarValueTextWrapper>
                        </DollarValueTextPanel>
                    </CategoryPanel>
                </PanelCol>

                <PanelCol lg={'6'}>
                    <CluePanel>
                        {!_.isEmpty(categoryName) && (
                            <FitText compressor={clueTextCompressor}>
                                {_.invoke(clueText, 'toUpperCase')}
                            </FitText>
                        )}
                    </CluePanel>

                    <Timer override={{ position: 'absolute', left: '25%', bottom: '0' }} height={'5%'} width={'50%'} start={startTimer} time={finalJeoparty ? timers.FINAL_JEOPARTY_ANSWER_TIMEOUT : timers.ANSWER_TIMEOUT} slideUp={false} />
                </PanelCol>
            </ClueRow>

            <LivefeedRow>
                <PanelCol lg={'12'}>
                    <PlayerNameText>{finalJeoparty ? 'WAITING FOR ANSWERS' : _.invoke(playerName, 'toUpperCase')}</PlayerNameText>
                    <LivefeedPanel>
                        <FitText compressor={1.5}>
                            {finalJeoparty ? `${currentAnswersSubmitted}/${totalAnswers} SUBMITTED` : _.isEmpty(answerLivefeed) ? <span>&nbsp;</span> : _.invoke(answerLivefeed, 'toUpperCase')}
                        </FitText>
                    </LivefeedPanel>
                </PanelCol>
            </LivefeedRow>
        </Container>
    );
};

export default BrowserAnswer;

