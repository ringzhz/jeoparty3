import React, { useContext, useState, useEffect } from 'react';

import { DebugContext } from '../../context/debug';
import { SocketContext } from '../../context/socket';

import drumrollSound from '../../assets/audio/drumroll.mp3';
import victorySound from '../../assets/audio/victory.mp3';
import fireworksSound from '../../assets/audio/fireworks.mp3';
import say from '../../helpers/say';
import { sayChampionIntroductionFiller } from '../../helpers/sayFiller';

// DEBUG
import { samplePlayers } from '../../constants/samplePlayers';

const BrowserPodium = (props) => {
    const debug = useContext(DebugContext);

    const [champion, setChampion] = useState(debug ? samplePlayers['zsS3DKSSIUOegOQuAAAA'] : {});

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('champion', (champion) => {
            setChampion(champion);

            sayChampionIntroductionFiller(() => {
                const drumrollAudio = new Audio(drumrollSound);

                drumrollAudio.onended = () => {
                    say(champion.name);
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
                            const fireworksAudio = new Audio(fireworksSound);

                            fireworksAudio.volume = 0.5;

                            victoryAudio.play();
                            fireworksAudio.play();
                        });
                    };

                    drumrollAudio.play();
                });
            }
        }
    }

    return (
        <div>
        </div>
    );
};

export default BrowserPodium;