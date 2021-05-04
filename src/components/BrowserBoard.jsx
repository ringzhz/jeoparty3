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

    let categoryTitleRow = categories.map((category) => {
        let categoryTitle = category.title;

        return (
            <Col lg={'2'}>
                {category && category.completed ? '' : categoryTitle}
            </Col>
        );
    });

    let clueRows = Array.from(Array(NUM_CLUES).keys()).map((j) => {
        let dollarValue = 200 * (j + 1);

        let clueCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            let clue = categories && categories[i].clues[j];
            console.log(categories);

            return (
                <Col lg={'2'}>
                    {clue && clue.completed ? '' : dollarValue}
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
