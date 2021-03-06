const path = require('path');
const express = require('express');
const randomWords = require('random-words');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
let cache = require('memory-cache');
const GameSession = require('../constants/GameSession').GameSession;
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../../build')));
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

io.on('connection', (socket) => {
    socket.emit('connect_device');
    socket.on('connect_device', (isMobile) => {
        console.log(`A new client with IP ${socket.handshake.address} has connected`);

        socket.isMobile = isMobile;

        if (!isMobile) {
            let sessionName = randomWords({exactly: 1, maxLength: 5});
            let session = Object.create(GameSession);

            socket.sessionName = sessionName;
            cache.put(sessionName, session);

            console.log(`New session (${sessionName}) has been created`);

            socket.emit('session_name', sessionName);
        }
    });

    socket.on('join_session', (sessionName) => {
        if (cache.get(sessionName)) {
            console.log(`${socket.id} has joined session(${sessionName})`)
        }
    });

    socket.on('disconnect', () => {
        if (socket.isMobile) {

        }

        if (!socket.isMobile && cache.get(socket.sessionName)) {
            cache.del(socket.sessionName);

            console.log(`session (${socket.sessionName}) has been deleted`);
        }
    });
});

server.listen(port);
