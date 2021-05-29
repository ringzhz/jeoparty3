import React, { useState, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { SocketContext } from '../context/socket';

const BrowserDecision = () => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showDecision, setShowDecision] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState('');

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('show_answer', (answer) => {
            setShowAnswer(true);
            setAnswer(answer);
        });

        socket.on('show_decision', (isCorrect) => {
            setShowAnswer(false);
            setShowDecision(true);
            setIsCorrect(isCorrect);
        });

        socket.on('show_correct_answer', (correctAnswer) => {
            setShowDecision(false);
            setShowCorrectAnswer(true);
            setCorrectAnswer(correctAnswer);
        });
    }, []);

    return (
        <Container fluid>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    {showAnswer && answer}
                    {showDecision && (isCorrect ? 'correct!' : 'incorrect!')}
                    {showCorrectAnswer && correctAnswer}
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserDecision;
