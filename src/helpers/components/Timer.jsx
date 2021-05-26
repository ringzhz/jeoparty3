import React from 'react';

import '../stylesheets/Timer.css';

const TimerFrame = (props) => {
    props.style.transform = `translateY(${props.start ? 0 : '20vh'})`;

    return (
        <div style={props.style} className={'timer-container'}>
            <div className={'timer-frame'}>
                {props.children}
                <span>
                    {Array.from(Array(9).keys()).map(() => {
                        return (
                            <div className={'timer-frame-cell'} />
                        );
                    })}
                </span>
            </div>
        </div>
    );
};

const Timer = (props) => {
    console.log(`rendering Timer with start=${props.start}`);

    return (
        <TimerFrame style={props.style} start={props.start}>
            <div className={'timer-background'} />
            <div style={{ transform: `scaleX(${props.start ? 0 : 1})`, transitionDuration: `${props.time}s` }} className={'timer'} />
        </TimerFrame>
    );
};

export default Timer;
