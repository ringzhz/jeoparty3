import React, { useState, useContext, useEffect } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import { formatDisplay } from '../../helpers/format';

import correctSound from '../../assets/audio/correct.mp3';
import incorrectSound from '../../assets/audio/incorrect.mp3';
import buzzInTimeoutSound from '../../assets/audio/buzzInTimeout.mp3';
import { sayDollarValueFiller, sayCorrectAnswerFiller } from '../../helpers/sayFiller';

const AnswerRow = styled(Row)`
    height: 100vh;
    display: flex;
    align-items: center;
`;

const AnswerCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const AnswerPanel = styled.div`
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

const DollarValueText = styled.span`
    position: absolute;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    
    font-family: board, serif;
    color: ${props => props.isCorrect ? '#009966' : '#CC3333'};
    text-shadow: 0.08em 0.08em #000;
    font-size: 10vh;
    
    top: ${props => props.showDollarValue ? '15vh' : '60vh'};
    transition-property: top;
    transition-duration: 1s;
    transition-timing-function: ease-out;
`;

const BrowserDecision = () => {
    const debug = useContext(DebugContext);

    const [showAnswer, setShowAnswer] = useState(debug ? true : false);
    const [showDecision, setShowDecision] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showDollarValue, setShowDollarValue] = useState(false);

    const [answer, setAnswer] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [dollarValue, setDollarValue] = useState(debug ? 200 : 0);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('show_answer', (answer) => {
            setShowAnswer(true);
            setAnswer(answer);
        });

        socket.on('show_decision', (isCorrect, dollarValue) => {
            setShowAnswer(false);
            setShowDecision(true);
            setIsCorrect(isCorrect);
            setDollarValue(dollarValue);

            setTimeout(() => {
                setShowDollarValue(true);

                if (isCorrect) {
                    const correctAudio = new Audio(correctSound);
                    correctAudio.volume = 0.5;
                    correctAudio.play();

                    sayDollarValueFiller(dollarValue);
                } else {
                    const incorrectAudio = new Audio(incorrectSound);
                    incorrectAudio.play();
                }
            }, 100);
        });

        socket.on('show_correct_answer', (correctAnswer, sayCorrectAnswer, skipScoreboard) => {
            setShowDecision(false);
            setShowAnswer(false);
            setShowCorrectAnswer(true);
            setCorrectAnswer(correctAnswer);

            if (sayCorrectAnswer) {
                if (skipScoreboard) {
                    const buzzInTimeoutAudio = new Audio(buzzInTimeoutSound);
                    buzzInTimeoutAudio.onended = () => {
                        sayCorrectAnswerFiller(correctAnswer, () => {
                            setTimeout(() => {
                                socket.emit('show_board');
                            }, 500);
                        });
                    };

                    buzzInTimeoutAudio.play();
                } else {
                    sayCorrectAnswerFiller(correctAnswer, () => {
                        setTimeout(() => {
                            socket.emit('show_scoreboard');
                        }, 500);
                    });
                }
            }
        });

        return () => {
            socket.off('show_decision');
            socket.off('show_correct_answer');
        };
    }, []);

    let text = null;

    if (!showAnswer && !showDecision && !showCorrectAnswer && !showDollarValue) {
        text = <span>&nbsp;</span>
    } else if (showAnswer || showDecision) {
        text = _.isEmpty(answer) ? <span>&nbsp;</span> : answer.toUpperCase();
    } else if (showCorrectAnswer) {
        text = formatDisplay(correctAnswer).toUpperCase();
    }

    return (
        <Container fluid>
            <AnswerRow>
                <AnswerCol lg={'12'}>
                    <AnswerPanel>
                        <FitText compressor={2}>
                            {text}
                        </FitText>
                    </AnswerPanel>

                    <DollarValueText isCorrect={isCorrect} showDollarValue={showDollarValue}>
                        {!showCorrectAnswer && `${isCorrect ? '+' : '-'}$${dollarValue}`}
                    </DollarValueText>
                </AnswerCol>
            </AnswerRow>
        </Container>
    );
};

export default BrowserDecision;
