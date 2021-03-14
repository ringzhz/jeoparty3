const path = require('path');
const express = require('express');
const randomWords = require('random-words');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

const GameSession = require('../constants/GameSession').GameSession;
const GameState = require('../constants/GameState').GameState;
const getRandomCategories = require('../helpers/jservice').getRandomCategories;

app.use(express.static(path.join(__dirname, '../../build')));
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

let cache = require('memory-cache');
let sessionCache = new cache.Cache();
let disconnectionCache = new cache.Cache();

const updateGameSession = (socket, key, newValue) => {
    let gameSession = sessionCache.get(socket.sessionName);

    if (Array.isArray(gameSession[key])) {
        let gameSessionArray = gameSession[key];
        gameSessionArray.push(newValue);
        gameSession[key] = gameSessionArray;
    } else {
        gameSession[key] = newValue;
    }

    sessionCache.put(socket.sessionName, gameSession);
};

io.on('connection', (socket) => {
    socket.emit('connect_device');
    socket.on('connect_device', (isMobile) => {
        console.log(`A new client (IP: ${socket.handshake.address}, id: ${socket.id}) has connected`);

        socket.isMobile = isMobile;

        if (!isMobile) {
            let sessionName = randomWords({exactly: 1, maxLength: 5});
            let session = Object.create(GameSession);

            socket.sessionName = sessionName;
            sessionCache.put(sessionName, session);
            disconnectionCache.put(sessionName, []);

            console.log(`A new session (${sessionName}) has been created`);

            socket.emit('session_name', sessionName);

            getRandomCategories((categories) => {
                console.log(categories);
                updateGameSession(socket, 'categories', categories);

                socket.emit('set_game_state', GameState.BOARD);
                socket.emit('categories', categories);
            });
        }
    });

    socket.on('join_session', (sessionName) => {
        if (sessionCache.get(sessionName)) {
            socket.sessionName = sessionName;

            updateGameSession(socket, 'players', socket.id);

            console.log(`Client (${socket.id}) has joined session (${sessionName})`);

            socket.emit('join_session_success', sessionName);
        } else {
            socket.emit('join_session_failure', sessionName);
        }
    });

    socket.on('disconnect', () => {
        if (socket.isMobile && sessionCache.get(socket.sessionName)) {
            console.log(`Client (IP: ${socket.handshake.address}, id: ${socket.id}) has disconnected`);

            let disconnections = disconnectionCache.get(socket.sessionName);
            disconnections.push(socket.handshake.address);
            disconnectionCache.put(socket.sessionName, disconnections);

            console.log(disconnectionCache.get(socket.sessionName));
        }

        if (!socket.isMobile && sessionCache.get(socket.sessionName)) {
            sessionCache.del(socket.sessionName);
            disconnectionCache.del(socket.sessionName);

            console.log(`Session (${socket.sessionName}) has been deleted`);
        }
    });
});

server.listen(port);
