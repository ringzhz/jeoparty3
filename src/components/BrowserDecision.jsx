import React, { useState, useContext, useEffect} from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {SocketContext} from '../context/socket';

const BrowserDecision = () => {
    const [answer, setAnswer] = useState('');
    const [decision, setDecision] = useState(false);
    const [showDecision, setShowDecision] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('decision', (answer, decision) => {
            setAnswer(answer);
            setDecision(decision);
        });

        socket.on('show_decision', () => {
            setShowDecision(true);
        });

        socket.on('show_answer', () => {
            setShowAnswer(true);
        });
    }, []);

    return (
        <Container fluid>
            <Row className={'text-center'}>
                <Col lg={'12'}>
                    Welcome to the browser decision page!
                </Col>
            </Row>
        </Container>
    );
};

export default BrowserDecision;
