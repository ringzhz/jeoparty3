import React, { useContext, useState, useEffect } from 'react';
import _ from 'lodash';
import FitText from '@kennethormandy/react-fittext';
import { Fireworks } from 'fireworks/lib/react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';
import mixins from '../../helpers/mixins';

import drumrollSound from '../../assets/audio/drumroll.mp3';
import victorySound from '../../assets/audio/victory.mp3';
import say from '../../helpers/say';
import { sayChampionIntroductionFiller } from '../../helpers/sayFiller';

// DEBUG
import { samplePlayers } from '../../constants/samplePlayers';

const PodiumContainer = styled(Container)`
    ${mixins.flexAlignCenter};
    height: 100vh;
    width: 100vw;
`;

const PodiumInfoText = styled.span`
    font-size: 4vh;
    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.1em 0.1em #000;
`;

const PodiumPanel = styled.div`
    height: 20%;
    border: 0.3em solid black;
    box-shadow: 0.5em 0.5em black;

    ${mixins.flexAlignCenter};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const PodiumPanelText = styled.span`
    font-weight: bold;
    font-family: clue, serif;
    text-shadow: 0.1em 0.1em #000;
`;

const PlayAgainInputGroup = styled(InputGroup)`
    position: absolute;
    bottom: 4%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
`;

const PlayAgainButton = styled(Button)`
    font-family: clue, serif;
    font-size: 3vh;
`;

const BrowserPodium = (props) => {
    const debug = useContext(DebugContext);

    const [champion, setChampion] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});
    const [championRevealed, setChampionRevealed] = useState(false);
    const [startFireworks, setStartFireworks] = useState(false);
    const [playAgain, setPlayAgain] = useState(false);

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('champion', (champion) => {
            setChampion(champion);

            sayChampionIntroductionFiller(() => {
                const drumrollAudio = new Audio(drumrollSound);

                drumrollAudio.onended = () => {
                    say(champion.name, () => {
                        const victoryAudio = new Audio(victorySound);

                        victoryAudio.onended = () => {
                            setPlayAgain(true);
                        };

                        victoryAudio.play();

                        setChampionRevealed(true);
                        setTimeout(() => {
                            setStartFireworks(true);
                        }, 500);
                    });
                };

                drumrollAudio.play();
            });
        });

        return () => {
            socket.off('champion');
        };
    });

    if (debug) {
        document.body.onkeyup = (e) => {
            if (e.keyCode === 32) {
                sayChampionIntroductionFiller(() => {
                    const drumrollAudio = new Audio(drumrollSound);

                    drumrollAudio.onended = () => {
                        say(champion.name, () => {
                            const victoryAudio = new Audio(victorySound);

                            victoryAudio.onended = () => {
                                setPlayAgain(true);
                            };

                            victoryAudio.play();

                            setChampionRevealed(true);
                            setTimeout(() => {
                                setStartFireworks(true);
                            }, 500);
                        });
                    };

                    drumrollAudio.play();
                });
            }
        }
    }

    const fireworks = [...new Array(15)].map(() => {
        const fxProps = {
            count: 1,
            interval: Math.random() * 2000 + 3000,
            colors: ['#e6261f', '#eb7532', '#f7d038', '#a3e048', '#49da9a', '#4355db', '#d23be7', '#ffb6c1'].sort(() => Math.random() - Math.random()).slice(0, 3),
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            canvasHeight: 600,
            canvasWidth: 600
        };

        return <Fireworks {...fxProps} />
    });

    return (
        <div>
            {startFireworks && fireworks}

            <PodiumContainer>
                <PodiumInfoText>
                    JEOPARTY! CHAMPION
                </PodiumInfoText>

                <PodiumPanel>
                    <FitText compressor={1.25}>
                        <PodiumPanelText>{championRevealed && _.invoke(_.get(champion, 'name'), 'toUpperCase')}</PodiumPanelText>
                    </FitText>
                </PodiumPanel>

                <PlayAgainInputGroup className={'mb-3 justify-content-center'}>
                    {playAgain && <PlayAgainButton onClick={() => window.location.reload()} variant={'outline-light'}>PLAY AGAIN</PlayAgainButton>}
                </PlayAgainInputGroup>
            </PodiumContainer>
        </div>
    );
};

export default BrowserPodium;