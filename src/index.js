import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const socket = io();

// sockets test
socket.on('hello', ({ message }) => alert(message));

ReactDOM.render(<App />, document.getElementById('root'));
reportWebVitals();
