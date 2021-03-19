import React, {useContext, useEffect, useState} from 'react';

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {SocketContext} from '../context/socket';

const BrowserClue = (props) => {
    const [clue, setClue] = useState('');

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('request_clue', (categoryIndex, clueIndex) => {
            let clue = props.categories[categoryIndex].clues[clueIndex].question;
            setClue(clue);
        });
    });

    return (
        <Container fluid>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    Welcome to the browser clue page!
                </Col>
            </Row>

            <Row className={'text-center'}>
                <Col lg={'12'}>
                    {clue}
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserClue;
