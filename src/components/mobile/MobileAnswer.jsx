import React, { useState, useCallback, useContext, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobileWait from '../../helpers/components/MobileWait';
import MobilePlayerCard from '../../helpers/components/MobilePlayerCard';

const MobileAnswerRow = styled.div`
    ${mixins.flexAlignCenter}
    height: 60vh;
`;

const BottomRow = styled.div`
    height: 15vh;
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 10vh;
    text-shadow: 0.075em 0.075em #000;
`;

const SubmitText = styled.span`
    font-weight: bold;
    font-family: clue, serif;
`;

const MobileAnswer = () => {
    // DEBUG
    // const [answer, setAnswer] = useState('');
    // const [isAnswering, setIsAnswering] = useState(true);

    const [answer, setAnswer] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('is_answering', (isAnswering) => {
            setIsAnswering(isAnswering);
        });

        socket.on('answer_timeout', (answer) => {
            socket.emit('submit_answer', answer);
        });
    }, []);

    const handleAnswerLivefeed = useCallback((e) => {
        setAnswer(e.target.value);
        socket.emit('answer_livefeed', e.target.value);
    }, [socket]);

    const handleSubmitAnswer = useCallback((answer) => {
        socket.emit('submit_answer', answer);
    }, [socket]);

    return (
        <Container fluid>
            {
                isAnswering && (
                    <div>
                        <MobilePlayerCard />

                        <MobileAnswerRow>
                            <Col lg={'12'}>
                                <LogoText>JEOPARTY!</LogoText>

                                <InputGroup className='mb-3'>
                                    <FormControl value={answer} onChange={e => handleAnswerLivefeed(e)} aria-describedby='basic-addon1' />
                                    <InputGroup.Prepend>
                                        <Button onClick={() => handleSubmitAnswer(answer)} variant='outline-light'><SubmitText>SUBMIT</SubmitText></Button>
                                    </InputGroup.Prepend>
                                </InputGroup>
                            </Col>
                        </MobileAnswerRow>

                        <BottomRow />
                    </div>
                )
            }

            {
                !isAnswering && (
                    <MobileWait />
                )
            }
        </Container>
    );
};

export default MobileAnswer;
