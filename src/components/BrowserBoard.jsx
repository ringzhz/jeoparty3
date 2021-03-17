import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../stylesheets/BrowserBoard.css';

const BrowserBoard = (props) => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    let categoryTitleRow = props.categories.map((category) => {
        let categoryTitle = category['title'];

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
