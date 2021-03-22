import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

const BrowserClue = () => {
    const [categories, setCategories] = useState(sampleCategories);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('request_clue', (categoryIndex, clueIndex) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);
        });
    });

    return (
        <Container fluid>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    Browser Clue <br />

                    {(categoryIndex !== null && clueIndex !== null) && (
                        categories[categoryIndex].clues[clueIndex].question
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserClue;
