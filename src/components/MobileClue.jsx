import React, { useState, useCallback, useContext } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { SocketContext } from '../context/socket';

const MobileClue = () => {
    const [isWaiting, setIsWaiting] = useState(true);
    const socket = useContext(SocketContext);

    const handleBuzzIn = useCallback(() => {
        socket.emit('buzz_in');
    }, []);

    return (
        <Container fluid>
            {
                isWaiting && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            <Button variant='danger' onClick={() => handleBuzzIn()}>Buzz In!</Button>
                        </Col>
                    </Row>
                )
            }

            {
                !isWaiting && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            You can't buzz in... dumbass!
                        </Col>
                    </Row>
                )
            }
        </Container>
    );
};

export default MobileClue;
