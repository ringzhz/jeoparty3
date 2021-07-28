import React, { useState, useContext, useEffect } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';
import dailyDoubleBackgroundImage from '../../assets/images/dailyDoubleBackground.jpeg';
import Timer from '../../helpers/components/Timer';
import {timers} from '../../constants/timers';

import { sayWagerFiller } from '../../helpers/sayFiller';

// DEBUG
import { sampleCategories } from '../../constants/sampleCategories';
import { samplePlayers } from '../../constants/samplePlayers';

const DailyDoubleBanner = styled.div`
    ${mixins.flexAlignCenter};
    height: 10vh;

    background-image: url(${dailyDoubleBackgroundImage});
    background-size: cover;
  
    padding-bottom: 0.5em;
`;

const WagerInfoContainer = styled(Container)`
    height: 70vh;
    width: 100vw;
`;

const WagerInfoWrapper = styled(Col)`
    height: 70vh;
    padding: 5vh;
`;

const WagerInfoRow = styled(Row)`
    height: 33%;
`;

const WagerInfoCol = styled(Col)`
    ${mixins.flexAlignCenter};
`;

const WagerInfoHeaderText = styled.span`
    font-size: 4vh;
    font-family: clue, serif;
    text-shadow: 0.1em 0.1em #000;
`;

const WagerInfoPanel = styled.div`
    height: 50%;
    border: 0.3em solid black;
    box-shadow: 0.5em 0.5em black;

    ${mixins.flexAlignCenter};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const WagerInfoPanelText = styled.span`
    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.1em 0.1em #000;
`;

const TimerRow = styled(Row)`
    height: 20vh;
    ${mixins.flexAlignCenter}
`;

const BrowserWager = () => {
    // DEBUG
    // const [doubleJeoparty, setDoubleJeoparty] = useState(false);
    // const [boardController, setBoardController] = useState(samplePlayers['zsS3DKSSIUOegOQuAAAA']);
    // const [wagerLivefeed, setWagerLivefeed] = useState('');
    // const [showTimer, setShowTimer] = useState(false);
    // const [startTimer, setStartTimer] = useState(false);

    const [doubleJeoparty, setDoubleJeoparty] = useState(false);
    const [boardController, setBoardController] = useState({});
    const [wagerLivefeed, setWagerLivefeed] = useState('5');
    const [showTimer, setShowTimer] = useState(false);
    const [startTimer, setStartTimer] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('board_controller', (boardController, doubleJeoparty) => {
            setBoardController(boardController);
            setDoubleJeoparty(doubleJeoparty);

            const score = _.get(boardController, 'score');
            sayWagerFiller(5, Math.max(score, doubleJeoparty ? 2000 : 1000), () => {
                socket.emit('start_wager_timer');
            });
        });

        socket.on('start_wager_timer', () => {
            setTimeout(() => {
                setShowTimer(true);

                setTimeout(() => {
                    setStartTimer(true);
                }, 100);
            }, 100);
        });

        socket.on('wager_livefeed', (wagerLivefeed) => {
            setWagerLivefeed(wagerLivefeed);
        });

        return () => {
            socket.off('board_controller');
        }
    });

    // DEBUG
    // document.body.onkeyup = (e) => {
    //     if (e.keyCode === 32) {
    //         const score = _.get(boardController, 'score');
    //         sayWagerFiller(5, Math.max(score, doubleJeoparty ? 2000 : 1000));
    //     }
    // };

    const WagerInfoPlayerCard = () => {
        return (
            <WagerInfoWrapper lg={'4'}>
                <WagerInfoRow>
                    <WagerInfoCol lg={'12'}>
                        <WagerInfoHeaderText>MIN</WagerInfoHeaderText>

                        <WagerInfoPanel>
                            <FitText compressor={1}>
                                <WagerInfoPanelText>$5</WagerInfoPanelText>
                            </FitText>
                        </WagerInfoPanel>
                    </WagerInfoCol>
                </WagerInfoRow>

                <WagerInfoRow>
                    <WagerInfoCol lg={'12'}>
                        <WagerInfoHeaderText>MAX</WagerInfoHeaderText>

                        <WagerInfoPanel>
                            <FitText compressor={1}>
                                <WagerInfoPanelText>${Math.max(_.get(boardController, 'score'), doubleJeoparty ? 2000 : 1000)}</WagerInfoPanelText>
                            </FitText>
                        </WagerInfoPanel>
                    </WagerInfoCol>
                </WagerInfoRow>

                <WagerInfoRow>
                    <WagerInfoCol lg={'12'}>
                        <WagerInfoHeaderText>{_.invoke(_.get(boardController, 'name'), 'toUpperCase')}</WagerInfoHeaderText>

                        <WagerInfoPanel>
                            <FitText compressor={1}>
                                <WagerInfoPanelText>{`${_.isEmpty(wagerLivefeed) ? '' : '$'}${wagerLivefeed}`}</WagerInfoPanelText>
                            </FitText>
                        </WagerInfoPanel>
                    </WagerInfoCol>
                </WagerInfoRow>
            </WagerInfoWrapper>
        );
    };

    return (
        <div>
            <DailyDoubleBanner>
                <mixins.DailyDoubleText style={{'font-size': '8vh'}}>
                    DAILY DOUBLE
                </mixins.DailyDoubleText>
            </DailyDoubleBanner>

            <WagerInfoContainer fluid>
                <Row>
                    <Col lg={'4'} />
                    <WagerInfoPlayerCard />
                    <Col lg={'4'} />
                </Row>
            </WagerInfoContainer>

            <TimerRow>
                {showTimer && <Timer height={'6vh'} width={'60vw'} start={startTimer} time={timers.WAGER_TIMEOUT} slideUp={true} />}
            </TimerRow>
        </div>
    );
};

export default BrowserWager;
