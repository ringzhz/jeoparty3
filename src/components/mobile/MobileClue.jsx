import React, {useState, useCallback, useContext, useEffect} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { SocketContext } from '../../context/socket';

const MobileClue = () => {
    const [hasAnswered, setHasAnswered] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('players_answered', (playersAnswered) => {
            setHasAnswered(playersAnswered.includes(socket.id));
        });
    }, []);

    const handleBuzzIn = useCallback(() => {
        socket.emit('buzz_in');
    }, [socket]);

    return (
        <Container fluid>
            {
                !hasAnswered && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            <Button variant='danger' onClick={() => handleBuzzIn()}>Buzz In!</Button>
                        </Col>
                    </Row>
                )
            }

            {
                hasAnswered && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            You've already buzzed in... dumbass!
                        </Col>
                    </Row>
                )
            }
        </Container>
    );
};

export default MobileClue;
