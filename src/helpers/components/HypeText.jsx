import React from 'react';
import _ from 'lodash';

import styled from 'styled-components';

const HypeTextLetter = styled.span`
    font-family: clue, serif;
    font-weight: bold;
    
    position: relative;
    animation: ${props => props.rainbow ? 'rainbow 1s, move-text 1s forwards' : 'move-text 1s forwards'};
    animation-iteration-count: ${props => props.rainbow ? 'infinite' : 1};
    animation-delay: ${props => `${0.5 + (props.index / 10)}s`};
    opacity: 0;
`;

const HypeText = (props) => {
    if (!_.get(props, 'text')) {
        return null;
    }

    return (
        <span>
            {
                Array.from(Array(props.text.length).keys()).map((i) => {
                    const c = props.text[i];

                    return (
                        <HypeTextLetter index={i} rainbow={props.rainbow}>{c}</HypeTextLetter>
                    );
                })
            }
        </span>
    );
};

export default HypeText;
