const path = require('path');
const express = require('express');
const randomWords = require('random-words');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

const Player = require('../constants/Player').Player;
const GameSession = require('../constants/GameSession').GameSession;
const GameState = require('../constants/GameState').GameState;
const getRandomCategories = require('../helpers/jservice').getRandomCategories;
const checkSignature = require('../helpers/checkSignature').checkSignature;

app.use(express.static(path.join(__dirname, '../../build')));
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

let cache = require('memory-cache');
let sessionCache = new cache.Cache();
let disconnectionCache = new cache.Cache();

const updateGameSession = (sessionName, key, value) => {
    let gameSession = sessionCache.get(sessionName);
    gameSession[key] = value;
    sessionCache.put(sessionName, gameSession);
};

const updatePlayers = (sessionName, playerId, key, value) => {
    let gameSession = sessionCache.get(sessionName);
    let players = gameSession['players'];

    if (!players[playerId]) {
        players[playerId] = Object.create(Player);
    }

    players[playerId][key] = value;
    gameSession['players'] = players;
    sessionCache.put(sessionName, gameSession);
};

const handlePlayerDisconnection = (socket) => {
    // Only 'remember' this player if they've submitted their signature (AKA if there's something worth remembering)
    if (sessionCache.get(socket.sessionName)['players'][socket.id]['name'].length > 0) {
        disconnectionCache.put(socket.handshake.address, sessionCache.get(socket.sessionName)['players'][socket.id]);

        let gameSession = sessionCache.get(socket.sessionName);
        let players = gameSession['players'];

        delete players[socket.id];
        gameSession['players'] = players;
        sessionCache.put(socket.sessionName, gameSession);
    }
};

const handlePlayerReconnection = (socket) => {
    let playerObject = disconnectionCache.get(socket.handshake.address);

    if (playerObject && sessionCache.get(playerObject.sessionName)) {
        let gameSession = sessionCache.get(playerObject.sessionName);
        let players = gameSession['players'];

        players[socket.id] = playerObject;
        gameSession['players'] = players;
        sessionCache.put(playerObject.sessionName, gameSession);

        socket.sessionName = playerObject.sessionName;

        disconnectionCache.del(socket.handshake.address);

        socket.emit('set_game_state', sessionCache.get(socket.sessionName)['currentGameState']);
        socket.emit('reconnect');
    }
};

io.on('connection', (socket) => {
    socket.emit('connect_device');
    socket.on('connect_device', (isMobile) => {
        console.log(`A new client (IP: ${socket.handshake.address}, id: ${socket.id}) has connected`);

        socket.isMobile = isMobile;

        if (isMobile) {
            handlePlayerReconnection(socket);
        } else {
            let sessionName = randomWords({exactly: 1, maxLength: 5})[0];
            let session = Object.create(GameSession);

            socket.sessionName = sessionName;
            socket.join(sessionName);

            sessionCache.put(sessionName, session);

            console.log(`A new session (${sessionName}) has been created`);

            socket.emit('session_name', sessionName);

            getRandomCategories((categories) => {
                console.log(categories);
                updateGameSession(socket.sessionName, 'categories', categories);

                socket.emit('categories', categories);
                // TODO: Emit this to everybody then have a state context in Game.js and pass
                //  'general state' like this down to all of the clients
            });
        }
    });

    socket.on('join_session', (sessionName) => {
        if (sessionCache.get(sessionName)) {
            socket.sessionName = sessionName;
            socket.join(sessionName);

            updatePlayers(socket.sessionName, socket.id, 'sessionName', sessionName);

            console.log(`Client (${socket.id}) has joined session (${sessionName})`);

            socket.emit('join_session_success', sessionName);
        } else {
            socket.emit('join_session_failure', sessionName);
        }
    });

    socket.on('submit_signature', (playerName) => {
        if (checkSignature(playerName)) {
            console.log(`Client (playerName: ${playerName}, id: ${socket.id}) has submitted their signature`);

            updatePlayers(socket.sessionName, socket.id, 'name', playerName);

            socket.emit('submit_signature_success');
        } else {
            socket.emit('submit_signature_failure');
        }
    });

    socket.on('start_game', () => {
        if (Object.keys(sessionCache.get(socket.sessionName)['players']).length > 0) {
            console.log(`Game session (${socket.sessionName}) is starting`);

            io.to(socket.sessionName).emit('set_game_state', GameState.BOARD);
            updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
        } else {
            socket.emit('start_game_failure');
        }
    });

    socket.on('disconnect', () => {
        if (socket.isMobile && sessionCache.get(socket.sessionName)) {
            console.log(`Client (IP: ${socket.handshake.address}, id: ${socket.id}) has disconnected`);

            handlePlayerDisconnection(socket);
        }

        if (!socket.isMobile && sessionCache.get(socket.sessionName)) {
            sessionCache.del(socket.sessionName);

            console.log(`Session (${socket.sessionName}) has been deleted`);
        }
    });
});

server.listen(port);
