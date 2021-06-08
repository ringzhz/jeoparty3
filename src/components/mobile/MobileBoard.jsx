import React, { useState, useCallback, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { sampleCategories } from '../../constants/sampleCategories';
import { SocketContext } from '../../context/socket';

import styled from 'styled-components';

const BoardItem = styled(ListGroup.Item)`
    padding: 0 !important;
`;

const MobileBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    const [categories, setCategories] = useState(sampleCategories);
    const [isBoardController, setIsBoardController] = useState(true);
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('is_board_controller', (isBoardController) => {
            setIsBoardController(isBoardController);
        });
    }, []);

    const handleRequestClue = useCallback((categoryIndex, clueIndex) => {
        socket.emit('request_clue', categoryIndex, clueIndex);
    }, [socket]);

    let categoryListGroupItems = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
        let category = categories[i];
        let categoryTitle = category.title;

        return (
            <BoardItem action active={categoryIndex === i} onClick={() => setCategoryIndex(i)} disabled={category && category.completed}>
                {category && category.completed ? '' : categoryTitle}
            </BoardItem>
        );
    });

    let clueListGroupItems = Array.from(Array(NUM_CLUES).keys()).forEach((i) => {
        if (categoryIndex === null) {
            return;
        }

        let category = categories[categoryIndex];
        let clue = category && category.clues[i];
        let dollarValue = 200 * (i + 1);

        return (
            <BoardItem action active={clueIndex === i} onClick={() => setClueIndex(i)} disabled={clue && clue.completed}>
                {clue && clue.completed ? '' : dollarValue}
            </BoardItem>
        );
    });

    return (
        <Container fluid>
            {
                isBoardController && (
                    <div>
                        <Row className={'category-list-row text-center'}>
                            <Col lg={'12'}>
                                <ListGroup>
                                    {categoryListGroupItems}
                                </ListGroup>
                            </Col>
                        </Row>

                        <hr />

                        <Row className={'clue-list-row text-center'}>
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

                        <Row className={'submit-button-row text-center'}>
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
