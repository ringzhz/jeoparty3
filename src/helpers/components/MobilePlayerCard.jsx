import React from 'react';

import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FitText from '@kennethormandy/react-fittext';

import mixins from '../mixins';
import HypeText from './HypeText';
import DollarValueText from './DollarValueText';

const getNameCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 15) {
        compressor = 0.7;
    } else if (textLength > 10) {
        compressor = 0.5;
    } else if (textLength > 5) {
        compressor = 0.35;
    } else {
        compressor = 0.25;
    }

    return compressor;
};

const getScoreCompressor = (score) => {
    let compressor = null;

    if (score >= 10000) {
        compressor = 0.3;
    } else if (score >= 1000) {
        compressor = 0.25;
    } else {
        compressor = 0.25;
    }

    return compressor;
};

const PlayerCardRow = styled(Row)`
    height: 15vh;
    height: calc(var(--vh, 1vh) * 15);
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
    padding-left: 0 !important;
    padding-right: 0 !important;
    flex-wrap: nowrap;
`;

const SignatureCol = styled(Col)`
    ${mixins.flexAlignCenter}
`;

const Signature = styled.img`
    display: block;
    margin: 0 auto;
    
    height: 10vh;
    height: calc(var(--vh, 1vh) * 10);
    
    width: 10vh;
    width: calc(var(--vh, 1vh) * 10);
    
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

const MobilePlayerCard = (props) => {
    return (
        <PlayerCardRow>
            <PlayerCardCol lg={'12'}>
                <InfoRow>
                    <SignatureCol lg={'2'}>
                        <Signature src={props.player.signature && props.player.signature} />
                    </SignatureCol>

                    <PlayerNameCol lg={'5'}>
                        <FitText compressor={props.player.name && getNameCompressor(props.player.name.length)}>
                            <PlayerNameText>{props.player.name && props.player.name.toUpperCase()}</PlayerNameText>
                        </FitText>
                    </PlayerNameCol>

                    <PlayerScoreCol lg={'5'}>
                        <FitText compressor={props.player.score && getScoreCompressor(Math.abs(props.player.score))}>
                            <PlayerScoreText>
                                <DollarValueText dollarValue={props.player.score && props.player.score} />
                            </PlayerScoreText>
                        </FitText>
                    </PlayerScoreCol>
                </InfoRow>
            </PlayerCardCol>
        </PlayerCardRow>
    );
};

export default MobilePlayerCard;
