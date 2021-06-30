import React, {useState, useCallback, useContext, useEffect} from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import MobileWait from '../../helpers/components/MobileWait';

const BuzzerRow = styled(Row)`
    height: 100vh;
    ${mixins.flexAlignCenter}
`;

const buzzerWidth = '75vw';
const buzzerHeight = '10vh';
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
    const [hasAnswered, setHasAnswered] = useState(false);
    const [player, setPlayer] = useState({});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('players_answered', (playersAnswered) => {
            setHasAnswered(playersAnswered.includes(socket.id));
        });

        socket.on('player', (player) => {
            setPlayer(player);
        });
    }, []);

    const handleBuzzIn = useCallback(() => {
        socket.emit('buzz_in');
    }, []);

    return (
        <Container fluid>
            {
                !hasAnswered && (
                    <BuzzerRow>
                        <Buzzer onClick={() => handleBuzzIn()} />
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
