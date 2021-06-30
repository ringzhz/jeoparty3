import React from 'react';

import styled from 'styled-components';

const DollarSignText = styled.span`
    font-size: 0.8em;
    display: inline-block;
    vertical-align: middle;

    padding-bottom: 0.15em;
    padding-right: 0.05em;
`;

const DollarValueText = (props) => {
    const dollarSign = props.dollarValue < 0 ? '-$' : '$';

    return (
        <span>
            <DollarSignText>{dollarSign}</DollarSignText>{Math.abs(props.dollarValue)}
        </span>
    );
};

export default DollarValueText;
