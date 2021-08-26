import React from 'react';
import _ from 'lodash';
import FitText from '@kennethormandy/react-fittext';
import styled from 'styled-components';

import starBackgroundImage from '../../assets/images/starBackground.png';
import backgroundImage from '../../assets/images/background.png';
import mixins from '../mixins';

const getCategoryNameCompressor = (textLength) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = 1;
    } else if (textLength > 10) {
        compressor = 0.75;
    } else {
        compressor = 0.5;
    }

    return compressor;
};

const CategoryRevealPanel = styled.div`
    ${mixins.flexAlignCenter};
    height: 100vh;
    width: 100vw;
    padding: 5%;
    z-index: 2;
    
    background-image: url(${backgroundImage});
    
    color: black;
    border-width: 2em;
    border-style: solid;
    
    line-height: 1;
`;

const CategoryRevealLogoPanel = styled.div`
    ${mixins.flexAlignCenter};
    position: absolute;
    height: 100vh;
    width: 100vw;
    z-index: 3;
    
    background-image: url(${starBackgroundImage});
    background-size: cover;
    opacity: ${props => props.reveal ? 0 : 1};
    transition-property: opacity;
    transition-duration: 0.5s;
    transition-timing-function: linear;
    
    color: black;
    border-width: 2em;
    border-style: solid;
`;

const CategoryRevealLogoText = styled.span`
    color: white;
    font-family: logo, serif;
    font-size: 36vh;
    text-shadow: 0.05em 0.05em #000;
    line-height: 1;
`;

const CategoryRevealText = styled.span`
    font-family: board, serif;
    color: white;
    text-shadow: 0.075em 0.075em #000;
`;

const CategoryYearText = styled.span`
    font-size: 12vh;
    font-family: board, serif;
    color: #d69f4c;
    text-shadow: 0.08em 0.08em #000;
`;

const CategoryReveal = (props) => {
    const categoryNameLength = _.size(props.categoryName) || 0;
    const categoryNameCompressor = getCategoryNameCompressor(categoryNameLength);

    return (
        <div key={props.categoryName}>
            <CategoryRevealLogoPanel reveal={props.reveal}>
                <CategoryRevealLogoText>
                    {props.finalJeoparty ? 'FINAL JEOPARTY!' : 'JEOPARTY!'}
                </CategoryRevealLogoText>
            </CategoryRevealLogoPanel>

            <CategoryRevealPanel>
                <FitText compressor={categoryNameCompressor}>
                    <CategoryRevealText>
                        {_.invoke(props.categoryName, 'toUpperCase')}
                    </CategoryRevealText>
                </FitText>

                <CategoryYearText>
                    {props.finalJeoparty ? '' : _.get(props, 'categoryYear')}
                </CategoryYearText>
            </CategoryRevealPanel>
        </div>
    );
};

export default CategoryReveal;