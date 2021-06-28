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
    margin-left: calc(10% / 2);
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
    font-family: board, serif;
    color: ${props => props.isCorrect ? '#009966' : '#CC3333'};
    text-shadow: 0.08em 0.08em #000;
    font-size: 10vh;
    
    transform: ${props => props.showPrice ?'translateY(0)' : 'translateY(50vh)'};
    transition-property: transform;
    transition-duration: 1s;
    transition-timing-function: ease-out;
`;

const BrowserDecision = () => {
    // DEBUG
    // const [showDecision, setShowDecision] = useState(true);
    // const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    // const [showPrice, setShowPrice] = useState(false);
    //
    // const [correctAnswer, setCorrectAnswer] = useState('George Washington');
    // const [isCorrect, setIsCorrect] = useState(false);
    // const [price, setPrice] = useState(1000);

    const [showDecision, setShowDecision] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
    const [showPrice, setShowPrice] = useState(false);

    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [price, setPrice] = useState(0);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('show_decision', (correctAnswer, isCorrect, price) => {
            setShowDecision(true);
            setCorrectAnswer(correctAnswer);
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
            <AnswerRow className={'text-center'}>
                {(showDecision || showCorrectAnswer) && (
                    <AnswerCol lg={'12'}>
                        <AnswerPanel>
                            <FitText compressor={2}>
                                {showDecision && (correctAnswer.toUpperCase())}
                                {showCorrectAnswer && correctAnswer.toUpperCase()}
                            </FitText>
                        </AnswerPanel>

                        <PriceText isCorrect={isCorrect} showPrice={showPrice}>
                            {showDecision && `${isCorrect ? '+' : '-'}$${price}`}
                        </PriceText>
                    </AnswerCol>
                )}
            </AnswerRow>
        </Container>
    );
};

export default BrowserDecision;
