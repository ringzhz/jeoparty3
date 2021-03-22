import React, { useState, useCallback, useContext, useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import { SocketContext } from '../context/socket';

const MobileAnswer = () => {
    const [answer, setAnswer] = useState('');
    const [hasAnswered, setHasAnswered] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('players_answered', (playersAnswered) => {
            setHasAnswered(playersAnswered.includes(socket.id));
        });
    }, []);

    const handleSubmitAnswer = useCallback((answer) => {
        socket.emit('submit_answer', answer);
    }, []);

    return (
        <Container fluid>
            {
                hasAnswered && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            You already answered... dumbass!
                        </Col>
                    </Row>
                )
            }

            {
                !hasAnswered && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            <InputGroup className='mb-3'>
                                <FormControl value={answer} onChange={e => setAnswer(e.target.value)} aria-describedby='basic-addon1' />
                                <InputGroup.Prepend>
                                    <Button onClick={() => handleSubmitAnswer(answer)} variant='outline-secondary'>Submit</Button>
                                </InputGroup.Prepend>
                            </InputGroup>
                        </Col>
                    </Row>
                )
            }
        </Container>
    );
};

export default MobileAnswer;
