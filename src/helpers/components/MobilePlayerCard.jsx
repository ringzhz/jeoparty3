import React from 'react';

import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import mixins from '../mixins';
import HypeText from './HypeText';

const PlayerCardRow = styled(Row)`
    height: 15vh;
    flex-direction: row;
`;

const PlayerCardCol = styled(Col)`
    border: 0.2em solid black;
    box-shadow: 0.2em 0.2em black;
    margin-top: 2.5%;
    margin-left: 5%;
    margin-right: 5%;
`;

const InfoRow = styled(Row)`
    height: 100%;
    flex-wrap: nowrap;
`;

const SignatureCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const Signature = styled.canvas`
    display: block;
    margin: 0 auto;
    
    height: 10vh;
    width: 10vh;
    
    background-color: white;
    border: 0.2em solid black;
    box-shadow: 0.2em 0.2em black;
`;

const PlayerNameCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const PlayerNameText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.1em 0.1em #000;
`;

const HypeCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const PlayerScoreCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const PlayerScoreText = styled.span`
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.1em 0.1em #000;
`;

const MobilePlayerCard = () => {
    return (
        <PlayerCardRow>
            <PlayerCardCol lg={'12'}>
                <InfoRow>
                    <SignatureCol lg={'3'}>
                        <Signature />
                    </SignatureCol>

                    <PlayerNameCol lg={'3'}>
                        <FitText compressor={0.4}>
                            <PlayerNameText>MONKEY D. LUFFY</PlayerNameText>
                        </FitText>
                    </PlayerNameCol>

                    <HypeCol lg={'3'}>
                        <FitText compressor={0.6}>
                            <HypeText text={'GENIUS'} rainbow={true} />
                        </FitText>
                    </HypeCol>

                    <PlayerScoreCol lg={'3'}>
                        <FitText compressor={0.4}>
                            <PlayerScoreText>$69000</PlayerScoreText>
                        </FitText>
                    </PlayerScoreCol>
                </InfoRow>
            </PlayerCardCol>
        </PlayerCardRow>
    );
};

export default MobilePlayerCard;
