import React, { useContext, useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FitText from '@kennethormandy/react-fittext';

import Timer from '../../helpers/components/Timer';
import { SocketContext } from '../../context/socket';

import styled from 'styled-components';
import mixins from '../../helpers/mixins';

import { timers } from '../../constants/timers';

// DEBUG
// import { sampleCategories } from '../../constants/sampleCategories';

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
    // DEBUG
    // const [categories, setCategories] = useState(sampleCategories);
    // const [categoryIndex, setCategoryIndex] = useState(0);
    // const [clueIndex, setClueIndex] = useState(0);
    // const [startTimer, setStartTimer] = useState(false);

    const [categories, setCategories] = useState({});
    const [categoryIndex, setCategoryIndex] = useState(null);
    const [clueIndex, setClueIndex] = useState(null);
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });

        socket.on('request_clue', (categoryIndex, clueIndex) => {
            setCategoryIndex(categoryIndex);
            setClueIndex(clueIndex);
        });

        setTimeout(() => {
            setStartTimer(true);
        }, 100);
    }, []);

    console.log(timers.BUZZ_IN_TIMEOUT);

    return (
        <Container fluid>
            <ClueRow>
                <ClueCol lg={'12'}>
                    <FitText compressor={2}>
                        {(categoryIndex !== null && clueIndex !== null) && (
                            categories[categoryIndex].clues[clueIndex].question.toUpperCase()
                        )}
                    </FitText>
                </ClueCol>
            </ClueRow>

            <TimerRow>
                <Timer height={'6vh'} width={'60vw'} start={startTimer} time={timers.BUZZ_IN_TIMEOUT} slideUp={true} />
            </TimerRow>
        </Container>
    );
};

export default BrowserClue;
