import React, { useState, useEffect } from 'react';

import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { HuePicker } from 'react-color';

import mixins from '../../helpers/mixins';

const SketchpadCanvas = styled.canvas`
    background: #ffffff;
    border: 0.25em solid black;
    box-shadow: 0.25em 0.25em black;
    
    cursor: crosshair;
`;

const SketchpadRow = styled(Row)`
    ${mixins.flexAlignCenter};
`;

const ColorPickerWrapper = styled.div`
    margin-top: 0.5em;
    margin-bottom: 1em;
    
    .hue-horizontal {
        div {
            // targets the slider button
            div {
                height: 22px !important;
                width: 22px !important;
            }
        }
    }
`;

const Sketchpad = (props) => {
    const [color, setColor] = useState('#ff0000');
    const [points, setPoints] = useState([]);
    const [undo, setUndo] = useState(false);

    const handleChange = (color) => {
        setColor(color.hex);
    };

    const undoStroke = () => {
        const canvas = document.getElementById('signature-canvas');
        const context = canvas.getContext('2d');

        context.clearRect(0,0, canvas.width, canvas.height);

        if (points.length < 3) {
            return;
        }

        let lastPointIndex = 0;

        for (let i = points.length - 2; i >= 0; i--) {
            const pt = points[i];

            if (pt.mode === 'draw' && points[i + 1].mode === 'end') {
                lastPointIndex = i;
                break;
            }
        }

        let newPoints = [];

        for (let i = 0; i < lastPointIndex + 1; i++) {
            const pt = points[i];
            newPoints.push(pt);

            if (pt.mode === 'begin') {
                context.beginPath();
                context.strokeStyle = pt.color;
                context.moveTo(pt.x, pt.y);
            }

            context.lineTo(pt.x, pt.y);

            if (pt.mode === 'end') {
                context.stroke();
                context.closePath();
            }
        }

        setPoints(newPoints);
        setUndo(!undo);
    };

    const reset = () => {
        const canvas = document.getElementById('signature-canvas');
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        setPoints([]);
    };

    useEffect(() => {
        const canvas = document.getElementById('signature-canvas');
        const context = canvas.getContext('2d');

        context.strokeStyle = color;
        context.lineWidth = 5;
        context.lineCap = 'round';

        let lastEvent;
        let drawing = false;
        let newPoints = points;

        const mouseDownEvent = e => {
            lastEvent = e;
            drawing = true;

            newPoints.push({
                x: e.offsetX,
                y: e.offsetY,
                color: color,
                mode: 'begin'
            });
        };

        const mouseMoveEvent = e => {
            if (drawing) {
                context.beginPath();

                context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
                context.lineTo(e.offsetX, e.offsetY);

                context.stroke();
                context.closePath();

                lastEvent = e;

                newPoints.push({
                    x: e.offsetX,
                    y: e.offsetY,
                    color: color,
                    mode: 'draw'
                });
            }
        };

        const mouseUpEvent = e => {
            drawing = false;

            newPoints.push({
                x: e.offsetX,
                y: e.offsetY,
                color: color,
                mode: 'end'
            });

            setPoints(newPoints);
        };

        const getTouchPos = e => {
            let touchX = 0;
            let touchY = 0;

            if (e && e.touches) {
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    const rect = canvas.getBoundingClientRect();

                    touchX = touch.clientX - rect.left;
                    touchY = touch.clientY - rect.top;
                }
            }

            return {x: touchX, y: touchY};
        };

        const touchStartEvent = e => {
            lastEvent = e;

            const touchPos = getTouchPos(e);

            newPoints.push({
                x: touchPos.x,
                y: touchPos.y,
                color: color,
                mode: 'begin'
            });
        };

        const touchMoveEvent = e => {
            context.beginPath();

            const lastTouchPos = getTouchPos(lastEvent);
            const touchPos = getTouchPos(e);

            context.moveTo(lastTouchPos.x, lastTouchPos.y);
            context.lineTo(touchPos.x, touchPos.y);

            context.stroke();
            context.closePath();

            lastEvent = e;

            newPoints.push({
                x: touchPos.x,
                y: touchPos.y,
                color: color,
                mode: 'draw'
            });
        };

        const touchEndEvent = () => {
            const lastPoint = points[points.length - 1];

            newPoints.push({
                x: lastPoint.x,
                y: lastPoint.y,
                color: color,
                mode: 'end'
            });

            setPoints(newPoints);
        };

        canvas.addEventListener('mousedown', mouseDownEvent);
        canvas.addEventListener('mousemove', mouseMoveEvent);
        canvas.addEventListener('mouseup', mouseUpEvent);

        canvas.addEventListener('touchstart', touchStartEvent);
        canvas.addEventListener('touchmove', touchMoveEvent);
        canvas.addEventListener('touchend', touchEndEvent);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color, undo]);

    return (
        <Container>
            <Row>
                <Col lg={'12'}>
                    <SketchpadCanvas height={250} width={250} id={'signature-canvas'} />
                </Col>
            </Row>

            <SketchpadRow>
                <Col lg={'12'}>
                    <ButtonGroup>
                        <ColorPickerWrapper>
                            <HuePicker
                                width={250}
                                height={20}
                                color={color}
                                onChange={handleChange}
                            />
                        </ColorPickerWrapper>
                    </ButtonGroup>

                    <br />

                    <ButtonGroup>
                        <Button variant={'outline-light'} onClick={() => undoStroke()}>UNDO</Button>
                        <Button variant={'outline-light'} onClick={() => reset()}>RESET</Button>
                        <Button variant={'outline-light'} onClick={() => props.onSubmit()}>SUBMIT</Button>
                    </ButtonGroup>
                </Col>
            </SketchpadRow>
        </Container>
    );
};

export default Sketchpad;
