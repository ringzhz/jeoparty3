import React from 'react';

import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import mixins from '../mixins';
import HypeText from './HypeText';
import MobilePlayerCard from './MobilePlayerCard';

const MobileWaitRow = styled(Row)`
    ${mixins.flexAlignCenter}
    height: 70vh;
`;

const LogoText = styled.h1`
    font-family: logo, serif;
    font-size: 10vh;
    text-shadow: 0.075em 0.075em #000;
`;

const BlankRow = styled.div`
    height: 15vh;
`;

const MobileWait = (props) => {
    return (
        <div>
            <MobilePlayerCard player={props.player} />

            <MobileWaitRow>
                <Col lg={'12'}>
                    <LogoText>JEOPARTY!</LogoText>
                    <HypeText text={'WAITING'} />
                </Col>
            </MobileWaitRow>

            <BlankRow />
        </div>
    );
};

export default MobileWait;
