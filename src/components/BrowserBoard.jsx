import React, {useContext, useState} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {SocketContext} from '../context/socket';

import '../stylesheets/BrowserBoard.css';

const BrowserBoard = () => {
    const [categories, setCategories] = useState([]);
    const socket = useContext(SocketContext);

    socket.on('categories', (categories) => {
        setCategories(categories);
    });

    let categoryTitleRow = categories.map((category) => {
        let categoryTitle = category['title'];

        return (
            <Col lg={'2'}>
                {categoryTitle}
            </Col>
        );
    });

    return (
        <Container fluid>
            <Row className={'board-row'}>
                {categoryTitleRow}
            </Row>
        </Container>
    );
};

export default BrowserBoard;
