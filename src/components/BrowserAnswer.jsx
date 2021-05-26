import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Timer from '../helpers/components/Timer';
import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

import '../stylesheets/BrowserAnswer.css';

const BrowserAnswer = () => {
    const [categories, setCategories] = useState(sampleCategories);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
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

        socket.on('answer_livefeed', (answerLivefeed) => {
            setAnswerLivefeed(answerLivefeed);
        });

        setTimeout(() => {
            setStartTimer(true);
        }, 100);
    });

    return (
        <Container fluid>
            <Row className={'answer-row text-center'}>
                <Col lg={'12'}>
                    Browser Answer <br />

                    {(categoryIndex !== null && clueIndex !== null) && (
                        categories[categoryIndex].clues[clueIndex].question
                    )}

                    <br />

                    Answer Livefeed: {answerLivefeed}
                </Col>
            </Row>

            <Row className={'timer-row'}>
                <Timer style={{ width: '60vw', height: '6vh' }} start={startTimer} time={5} />
            </Row>
        </Container>
    );
};

export default BrowserAnswer;

