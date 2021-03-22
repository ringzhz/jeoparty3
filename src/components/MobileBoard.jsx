import React, { useState, useCallback, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

const MobileBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    const [categories, setCategories] = useState(sampleCategories);
    const [isBoardController, setIsBoardController] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('board_controller', (boardController) => {
            setIsBoardController(boardController === socket.id);
        });
    }, []);

    const handleRequestClue = useCallback((categoryIndex, clueIndex) => {
        socket.emit('request_clue', categoryIndex, clueIndex);
    }, []);

    let categoryListGroupItems = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        let categoryTitle = categories[i].title;

        return (
            <ListGroup.Item action active={categoryIndex === i} onClick={() => setCategoryIndex(i)}>
                {categoryTitle}
            </ListGroup.Item>
        );
    });

    let clueListGroupItems = Array.from(Array(NUM_CLUES).keys()).map((i) => {
        let dollarValue = (i + 1) * 200;

        return (
            <ListGroup.Item action active={clueIndex === i} onClick={() => setClueIndex(i)}>
                {dollarValue}
            </ListGroup.Item>
        );
    });

    return (
        <Container fluid>
            {
                isBoardController && (
                    <div>
                        <Row className={'text-center'}>
                            <Col lg={'12'}>
                                <ListGroup>
                                    {categoryListGroupItems}
                                </ListGroup>
                            </Col>
                        </Row>

                        <hr />

                        <Row className={'text-center'}>
                            <Col lg={'12'}>
                                {
                                    categoryIndex !== null && (
                                        <ListGroup>
                                            {clueListGroupItems}
                                        </ListGroup>
                                    )
                                }
                            </Col>
                        </Row>

                        <Row className={'text-center'}>
                            <Col lg={'12'}>
                                {
                                    (categoryIndex !== null && clueIndex !== null) && (
                                        <InputGroup className='mb-3 justify-content-center'>
                                            <Button onClick={() => handleRequestClue(categoryIndex, clueIndex)} variant='dark'>Submit</Button>
                                        </InputGroup>
                                    )
                                }
                            </Col>
                        </Row>
                    </div>
                )
            }

            {
                !isBoardController && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            You can't select a clue... dumbass!
                        </Col>
                    </Row>
                )
            }
        </Container>
    );
};

export default MobileBoard;
