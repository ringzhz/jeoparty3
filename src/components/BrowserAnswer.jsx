import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FitText from '@kennethormandy/react-fittext';

import Timer from '../helpers/components/Timer';
import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

import '../stylesheets/BrowserAnswer.css';

const BrowserAnswer = () => {
    const [categories, setCategories] = useState(sampleCategories);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [clueIndex, setClueIndex] = useState(0);
    const [answerLivefeed, setAnswerLivefeed] = useState('led zeppelin');
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
                <Col className={'mini-clue-col'} lg={'6'}>
                    <div className={'mini-clue'}>
                        <FitText compressor={1}>
                            {(categoryIndex !== null && clueIndex !== null) && (
                                categories[categoryIndex].clues[clueIndex].question.toUpperCase()
                            )}
                        </FitText>
                    </div>
                </Col>
                <Col className={'livefeed-col'} lg={'6'}>
                    <span className={'player-name-text'}>MATT</span>
                    <div className={'livefeed'}>
                        <FitText compressor={1.5}>
                            {answerLivefeed.toUpperCase()}
                        </FitText>
                    </div>
                </Col>
            </Row>

            <Row className={'timer-row'}>
                <Timer style={{ width: '60vw', height: '6vh' }} start={startTimer} time={5} />
            </Row>
        </Container>
    );
};

export default BrowserAnswer;

