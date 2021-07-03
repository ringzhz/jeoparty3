import React, { useState, useContext, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';

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

const PriceText = styled.span`
    position: absolute;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    
    font-family: board, serif;
    color: ${props => props.isCorrect ? '#009966' : '#CC3333'};
    text-shadow: 0.08em 0.08em #000;
    font-size: 10vh;
    
    top: ${props => props.showPrice ? '15vh' : '60vh'};
    transition-property: top;
    transition-duration: 1s;
    transition-timing-function: ease-out;
`;

const BrowserDecision = () => {
    // DEBUG
    // const [showAnswer, setShowAnswer] = useState(true);
    // const [showDecision, setShowDecision] = useState(false);
    // const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    // const [showPrice, setShowPrice] = useState(false);
    //
    // const [answer, setAnswer] = useState('');
    // const [correctAnswer, setCorrectAnswer] = useState('');
    // const [isCorrect, setIsCorrect] = useState(false);
    // const [price, setPrice] = useState(200);

    const [showAnswer, setShowAnswer] = useState(false);
    const [showDecision, setShowDecision] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showPrice, setShowPrice] = useState(false);

    const [answer, setAnswer] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [price, setPrice] = useState(0);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('show_answer', (answer) => {
            setShowAnswer(true);
            setAnswer(answer);
        });

        socket.on('show_decision', (isCorrect, price) => {
            setShowAnswer(false);
            setShowDecision(true);
            setIsCorrect(isCorrect);
            setPrice(price);

            setTimeout(() => {
                setShowPrice(true);
            }, 100);
        });

        socket.on('show_correct_answer', (correctAnswer) => {
            setShowDecision(false);
            setShowCorrectAnswer(true);
            setCorrectAnswer(correctAnswer);
        });

        // DEBUG
        // document.body.onkeyup = (e) => {
        //     if (e.keyCode === 32) {
        //         setShowPrice(true);
        //     }
        // }
    }, []);

    return (
        <Container fluid>
            <AnswerRow>
                <AnswerCol lg={'12'}>
                    <AnswerPanel>
                        <FitText compressor={2}>
                            {(!showAnswer && !showDecision && !showCorrectAnswer && !showPrice) && <span>&nbsp;</span>}
                            {(showAnswer || showDecision) && (answer.length > 0 ? answer.toUpperCase() : <span>&nbsp;</span>)}
                            {showCorrectAnswer && correctAnswer.toUpperCase()}
                        </FitText>
                    </AnswerPanel>

                    <PriceText isCorrect={isCorrect} showPrice={showPrice}>
                        {!showCorrectAnswer && `${isCorrect ? '+' : '-'}$${price}`}
                    </PriceText>
                </AnswerCol>
            </AnswerRow>
        </Container>
    );
};

export default BrowserDecision;
