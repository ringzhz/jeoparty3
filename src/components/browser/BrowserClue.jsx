import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import { timers } from '../../constants/timers';
import mixins from '../../helpers/mixins';
import Timer from '../../helpers/components/Timer';

import finalJeopartyPingSound from '../../assets/audio/finalJeopartyPing.mp3';
import say from '../../helpers/say';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';

const getClueTextCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 200) {
        compressor = 2.5;
    } else if (textLength > 100) {
        compressor = 2.25;
    } else {
        compressor = 2;
    }

    return compressor;
};

const BrowserClueContainer = styled(Container)`
    height: 100vh;
    width: 100vw;
`;

const ClueRow = styled(Row)`
    height: 80vh;
`;

const ClueCol = styled(Col)`
    ${mixins.flexAlignCenter}

    padding-left: 10em !important;
    padding-right: 10em !important;

    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.35em 0.35em #000;
`;

const TimerRow = styled(Row)`
    height: 20vh;
    ${mixins.flexAlignCenter}
`;

const BrowserClue = () => {
    const debug = useContext(DebugContext);

    const [clueText, setClueText] = useState(debug ? sampleCategories[0].clues[0].question : '');
    const [showTimer, setShowTimer] = useState(false);
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('clue_text', (clueText) => {
            setClueText(clueText);
        });

        socket.on('say_clue_text', (clueText, dailyDouble, finalJeoparty, sayClueText) => {
            if (sayClueText) {
                if (finalJeoparty) {
                    const finalJeopartyPingAudio = new Audio(finalJeopartyPingSound);

                    finalJeopartyPingAudio.onended = () => {
                        say(clueText, () => {
                            socket.emit('wager_buzz_in');
                        });
                    };

                    finalJeopartyPingAudio.play();
                } else {
                    say(clueText, () => {
                        socket.emit(dailyDouble ? 'wager_buzz_in' : 'start_timer');
                    });
                }
            }
        });

        socket.on('start_timer', () => {
            setTimeout(() => {
                setShowTimer(true);

                setTimeout(() => {
                    setStartTimer(true);
                }, 100);
            }, 100);
        });

        return () => {
            socket.off('say_clue_text');
        }
    }, []);

    const clueTextLength = _.size(clueText) || 0;
    const clueTextCompressor = getClueTextCompressor(clueTextLength);

    return (
        <BrowserClueContainer fluid>
            <ClueRow>
                <ClueCol lg={'12'}>
                    {!_.isEmpty(clueText) && (
                        <FitText compressor={clueTextCompressor}>
                            {_.invoke(clueText, 'toUpperCase')}
                        </FitText>
                    )}
                </ClueCol>
            </ClueRow>

            <TimerRow>
                {showTimer && <Timer height={'6vh'} width={'60vw'} start={startTimer} time={timers.BUZZ_IN_TIMEOUT} slideUp={true} />}
            </TimerRow>
        </BrowserClueContainer>
    );
};

export default BrowserClue;
