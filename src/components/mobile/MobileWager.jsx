import React, { useState, useCallback, useContext, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobilePlayerCard from '../../helpers/components/MobilePlayerCard';
import MobileWait from '../../helpers/components/MobileWait';

// DEBUG
import {samplePlayers} from '../../constants/samplePlayers';

const MobileWagerRow = styled.div`
    ${mixins.flexAlignCenter}
    height: 60vh;
    height: calc(var(--vh, 1vh) * 60);
`;

const BottomRow = styled.div`
    height: 15vh;
    height: calc(var(--vh, 1vh) * 15);
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 10vh;
    font-size: calc(var(--vh, 1vh) * 10);
    text-shadow: 0.075em 0.075em #000;
`;

const MobileWager = () => {
    const debug = useContext(DebugContext);

    const [wager, setWager] = useState('5');
    const [isWagering, setIsWagering] = useState(debug ? true : false);
    const [player, setPlayer] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('is_wagering', (isWagering) => {
            setIsWagering(isWagering);
        });

        socket.on('wager_timeout', (wager) => {
            socket.emit('submit_wager', wager);
        });

        socket.on('player', (player) => {
            setPlayer(player);
        });
    }, []);

    const handleWagerLivefeed = useCallback((e) => {
        setWager(e.target.value);
        socket.emit('wager_livefeed', e.target.value);
    }, []);

    const handleSubmitWager = useCallback((wager) => {
        socket.emit('submit_wager', wager);
    }, []);

    return (
        <Container fluid>
            {
                isWagering && (
                    <div>
                        <MobilePlayerCard player={player} />

                        <MobileWagerRow>
                            <Col lg={'12'}>
                                <LogoText>JEOPARTY!</LogoText>

                                <InputGroup className={'mb-3'}>
                                    <FormControl type={'tel'} placeholder={'Enter your wager...'} value={wager} onChange={e => handleWagerLivefeed(e)} />
                                    <InputGroup.Prepend>
                                        <Button onClick={() => handleSubmitWager(wager)} variant={'outline-light'}>SUBMIT</Button>
                                    </InputGroup.Prepend>
                                </InputGroup>
                            </Col>
                        </MobileWagerRow>

                        <BottomRow />
                    </div>
                )
            }

            {
                !isWagering && (
                    <div>
                        <MobileWait player={player} />
                    </div>
                )
            }
        </Container>
    );
};

export default MobileWager;
