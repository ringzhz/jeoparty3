import React, { useState, useContext, useEffect} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../stylesheets/BrowserBoard.css';

import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

const BrowserBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    const [categories, setCategories] = useState(sampleCategories);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });
    }, []);

    // TODO: Here and MobileBoard: Conditional rendering based on .completed flag of categories and clues
    let categoryTitleRow = categories.map((category) => {
        let categoryTitle = category.title;

        return (
            <Col lg={'2'}>
                {categoryTitle}
            </Col>
        );
    });

    let clueRows = Array.from({length: NUM_CLUES}, (_, i) => i + 1).map((value) => {
        let dollarValue = value * 200;

        let clueCols = Array.from(Array(NUM_CATEGORIES).keys()).map(() => {
            return (
                <Col lg={'2'}>
                    {dollarValue}
                </Col>
            );
        });

        return (
            <Row className={'board-row'}>
                {clueCols}
            </Row>
        );
    });

    return (
        <Container fluid>
            <Row className={'board-row'}>
                {categoryTitleRow}
            </Row>

            {clueRows}
        </Container>
    );
};

export default BrowserBoard;
