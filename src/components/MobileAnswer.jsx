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
    const [isAnswering, setIsAnswering] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('is_answering', (isAnswering) => {
            setIsAnswering(isAnswering);
        });
    }, []);

    const handleAnswerLivefeed = useCallback((e) => {
        setAnswer(e.target.value);
        socket.emit('answer_livefeed', e.target.value);
    }, []);

    const handleSubmitAnswer = useCallback((answer) => {
        socket.emit('submit_answer', answer);
    }, []);

    return (
        <Container fluid>
            {
                isAnswering && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            <InputGroup className='mb-3'>
                                <FormControl value={answer} onChange={e => handleAnswerLivefeed(e)} aria-describedby='basic-addon1' />
                                <InputGroup.Prepend>
                                    <Button onClick={() => handleSubmitAnswer(answer)} variant='outline-secondary'>Submit</Button>
                                </InputGroup.Prepend>
                            </InputGroup>
                        </Col>
                    </Row>
                )
            }

            {
                !isAnswering && (
                    <Row className={'text-center'}>
                        <Col lg={'12'}>
                            You're not answering... dumbass!
                        </Col>
                    </Row>
                )
            }
        </Container>
    );
};

export default MobileAnswer;
