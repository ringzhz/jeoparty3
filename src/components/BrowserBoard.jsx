import React, { useState, useContext, useEffect} from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FitText from '@kennethormandy/react-fittext';

import '../stylesheets/BrowserBoard.css';

import { sampleCategories } from '../constants/sampleCategories';
import { SocketContext } from '../context/socket';

const BrowserBoard = () => {
    const NUM_CATEGORIES = 6;
    const NUM_CLUES = 5;

    const [categories, setCategories] = useState(sampleCategories);
    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.on('categories', (categories) => {
            setCategories(categories);
        });
    }, []);

    let categoryTitleRow = categories.map((category) => {
        let categoryTitle = category.title;

        return (
            <Col className={'category-col'} lg={'2'}>
                <div className={'fit-text-wrapper'}>
                    <FitText compressor={0.5}>
                        <span className={'category-text'}>{category && category.completed ? '' : categoryTitle.toUpperCase()}</span>
                    </FitText>
                </div>
            </Col>
        );
    });

    let priceRows = Array.from(Array(NUM_CLUES).keys()).map((j) => {
        let dollarValue = 200 * (j + 1);

        let priceCols = Array.from(Array(NUM_CATEGORIES).keys()).map((i) => {
            let clue = categories && categories[i].clues[j];

            return (
                <Col className={'price-col'} lg={'2'}>
                    <div className={'fit-text-wrapper'}>
                        <FitText compressor={0.3}>
                            {clue && clue.completed ? '' :
                                <span className={'price-text'}>
                                    <span className={'dollar-sign-text'}>$</span>
                                    {dollarValue}
                                </span>
                            }
                        </FitText>
                    </div>
                </Col>
            );
        });

        return (
            <Row className={'price-text board-row'}>
                {priceCols}
            </Row>
        );
    });

    return (
        <Container fluid>
            <Row className={'category-text board-row'}>
                {categoryTitleRow}
            </Row>

            {priceRows}
        </Container>
    );
};

export default BrowserBoard;
