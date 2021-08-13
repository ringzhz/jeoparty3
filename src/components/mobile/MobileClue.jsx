import React, {useState, useCallback, useContext, useEffect} from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobileWait from '../../helpers/components/MobileWait';

// DEBUG
import {samplePlayers} from '../../constants/samplePlayers';

const BuzzerRow = styled(Row)`
    ${mixins.flexAlignCenter}
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
`;

const buzzerWidth = '75vw';
const buzzerHeight = '10vh';
const calcBuzzerHeight = 'calc(var(--vh, 1vh) * 10)';
const clickTime = '.1s';

const Buzzer = styled.div`
    box-shadow: 0px 15px 0 20px #352d2d, 0px 40px 0 30px #000000;
    cursor: pointer;
    background-color: #c0392b;
    position: absolute;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    width: ${buzzerWidth};
    height: ${buzzerHeight};
    height: ${calcBuzzerHeight};
    transform: translateX(-50%);

    &:before {
        content: '';
        z-index: 1;
        border-radius: 50%;
        background-color: #e74c3c;
        position: absolute;
        bottom: 100%;
        left: 0%;
        transition: bottom ${clickTime};
        width: ${buzzerWidth};
        height: ${buzzerHeight};
    }

    &:after {
        content: '';
        background-color: #c0392b;
        position: absolute;
        bottom: 50%;
        left: 0%;
        width: ${buzzerWidth};
        height: ${buzzerHeight};
        transition: height ${clickTime};
    }

    &:active {
        &:before { 
            bottom: 10%; 
        }
        
        &:after {
            height: 10%;
        }
    }
`;

const MobileClue = () => {
    const debug = useContext(DebugContext);

    const [hasAnswered, setHasAnswered] = useState(true);
    const [player, setPlayer] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('has_answered', (hasAnswered) => {
            setHasAnswered(hasAnswered);
        });

        socket.on('player', (player) => {
            setPlayer(player);
        });

        socket.on('start_timer', () => {
            setStartTimer(true);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBuzzIn = useCallback((startTimer) => {
        if (startTimer) {
            socket.emit('buzz_in');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container fluid>
            {
                !hasAnswered && (
                    <BuzzerRow>
                        <Buzzer onClick={() => handleBuzzIn(startTimer)} />
                    </BuzzerRow>
                )
            }

            {
                hasAnswered && (
                    <div>
                        <MobileWait player={player} />
                    </div>
                )
            }
        </Container>
    );
};

export default MobileClue;
