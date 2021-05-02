import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

const BrowserAnswer = () => {
    const [categories, setCategories] = useState(sampleCategories);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const [answerLivefeed, setAnswerLivefeed] = useState('');
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
    });

    return (
        <Container fluid>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    Browser Answer <br />

                    {(categoryIndex !== null && clueIndex !== null) && (
                        categories[categoryIndex].clues[clueIndex].question
                    )}

                    <br />

                    Answer Livefeed: {answerLivefeed}
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserAnswer;

