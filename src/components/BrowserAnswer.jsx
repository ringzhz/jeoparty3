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
    const [foo, setFoo] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        document.body.onkeyup = (e) => {
            if (e.keyCode === 32) {
                setFoo(true);
            }
        };

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
                {/*<Timer style={{ width: '60vw', height: '6vh' }} start={foo} time={10} />*/}
            </Row>
        </Container>
    );
};

export default BrowserAnswer;

