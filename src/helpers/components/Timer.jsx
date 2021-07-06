import React from 'react';

import styled from 'styled-components';

import timerFrameImage from '../../assets/images/timerFrame.png';
import timerBackgroundImage from '../../assets/images/timerBackground.png';
import timerImage from '../../assets/images/timer.png';

const TimerContainer = styled.div`
    height: ${props => props.height};
    width: ${props => props.width};
    
    transform: ${props => props.start || !props.slideUp ? 'translateY(0)' : 'translateY(20vh)'};
    transition-property: transform;
    transition-duration: 1s;
    transition-timing-function: ease-out;
`;

const TimerFrame = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const TimerFrameCell = styled.div`
    position: relative;
    float: left;
    width: 11.11%;
    height: 100%;
    
    border-style: solid;
    border-top-width: 0.3em;
    border-bottom-width: 0.3em;
    border-left-width: 0.1em;
    border-right-width: 0.1em;
    
    border-image: url(${timerFrameImage}) 20 20 round;
    z-index: 3;
    
    &:first-child {
        border-left-width: 0.3em;
    }
    
    &:last-child {
        border-right-width: 0.3em;
    }
`;

const TimerBackground = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-image: url(${timerBackgroundImage});
    background-size: cover;
`;

const TimerBody = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-image: url(${timerImage});
    background-size: cover;
 
    transform: ${props => props.start ? 'scaleX(0)' : 'scaleX(1)'};

    transition-property: transform;
    transition-timing-function: linear;
    transition-duration: ${props => `${props.time}s`}
`;

const TimerWrapper = (props) => {
    return (
        <TimerContainer style={props.override} height={props.height} width={props.width} start={props.start} slideUp={props.slideUp}>
            <TimerFrame>
                {props.children}
                <span>
                    {Array.from(Array(9).keys()).map(() => {
                        return (
                            <TimerFrameCell />
                        );
                    })}
                </span>
            </TimerFrame>
        </TimerContainer>
    );
};

const Timer = (props) => {
    return (
        <TimerWrapper override={props.override} height={props.height} width={props.width} start={props.start} slideUp={props.slideUp}>
            <TimerBackground />
            <TimerBody start={props.start} time={props.time} />
        </TimerWrapper>
    );
};

export default Timer;
