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
const checkAnswer = require('../helpers/checkAnswer').checkAnswer;

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

const updatePlayers = (sessionName, socketId, key, value) => {
    let gameSession = sessionCache.get(sessionName);
    let players = gameSession['players'];

    if (!players[socketId]) {
        players[socketId] = Object.create(Player);
        players[socketId].socketId = socketId;
    }

    players[socketId][key] = value;
    gameSession['players'] = players;
    sessionCache.put(sessionName, gameSession);
};

const updatePlayersAnswered = (sessionName, socketId) => {
    let gameSession = sessionCache.get(sessionName);

    let playersAnswered = gameSession['playersAnswered'];
    playersAnswered.push(socketId);
    gameSession['playersAnswered'] = playersAnswered;

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

        // If this player has already answered the current clue then they shouldn't be allowed to answer again
        if (gameSession.playersAnswered.includes(playerObject.socketId)) {
            let playersAnswered = gameSession.playersAnswered;
            playersAnswered.push(socket.id);
            gameSession.playersAnswered = playersAnswered;

            playerObject.socketId = socket.id;
        }

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
                updateGameSession(socket.sessionName, 'categories', categories);
            });
        }
    });

    socket.on('join_session', (sessionName) => {
        if (sessionCache.get(sessionName)) {
            socket.sessionName = sessionName;
            socket.join(sessionName);

            updatePlayers(socket.sessionName, socket.id, 'sessionName', sessionName);

            if (!sessionCache.get(socket.sessionName).boardController) {
                updateGameSession(socket.sessionName, 'boardController', socket.id);
            }

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
            io.to(socket.sessionName).emit('categories', sessionCache.get(socket.sessionName).categories);
            io.to(socket.sessionName).emit('board_controller', sessionCache.get(socket.sessionName).boardController);

            updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
        } else {
            socket.emit('start_game_failure');
        }
    });

    socket.on('request_clue', (categoryIndex, clueIndex) => {
        console.log(`Game session (${socket.sessionName}) is requesting categoryIndex ${categoryIndex} and clueIndex ${clueIndex}`);

        updateGameSession(socket.sessionName, 'categoryIndex', categoryIndex);
        updateGameSession(socket.sessionName, 'clueIndex', clueIndex);

        io.to(socket.sessionName).emit('set_game_state', GameState.CLUE);
        io.to(socket.sessionName).emit('request_clue', categoryIndex, clueIndex);
        io.to(socket.sessionName).emit('players_answered', sessionCache.get(socket.sessionName).playersAnswered);
    });

    socket.on('buzz_in', () => {
        console.log(`Client (${socket.id}) has buzzed in`);

        io.to(socket.sessionName).emit('set_game_state', GameState.ANSWER);
    });

    socket.on('submit_answer', (answer) => {
        updatePlayersAnswered(socket.sessionName, socket.id);

        let categoryIndex = sessionCache.get(socket.sessionName).categoryIndex;
        let clueIndex = sessionCache.get(socket.sessionName).clueIndex;
        let correctAnswer = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].answer;

        io.to(socket.sessionName).emit('set_game_state', GameState.DECISION);
        io.to(socket.sessionName).emit('decision', checkAnswer(correctAnswer, answer));

        // TODO: Add browser and mobile components for DECISION

        if (sessionCache.get(socket.sessionName).playersAnswered.length === sessionCache.get(socket.sessionName).players.length) {
            // TODO: Send SCOREBOARD after timeout, reset categoryIndex and clueIndex, empty out playersAnswered
        } else {
            // TODO: Send CLUE after timeout
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
