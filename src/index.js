import React from 'react';
import ReactDOM from 'react-dom';

import Game from './Game';

import { socket } from './context/socket';

socket.on('connect_device', () => {
    socket.emit('connect_device', /Mobi/.test(navigator.userAgent));
});

ReactDOM.render(<Game />, document.getElementById('root'));
