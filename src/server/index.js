const path = require('path');
const express = require('express');
const randomWords = require('random-words');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

let cache = require('memory-cache');
let sessionCache = new cache.Cache();
let disconnectionCache = new cache.Cache();

const Player = require('../constants/Player').Player;
const GameSession = require('../constants/GameSession').GameSession;
const GameState = require('../constants/GameState').GameState;
const getRandomCategories = require('../helpers/jservice').getRandomCategories;
const checkSignature = require('../helpers/checkSignature').checkSignature;
const checkAnswer = require('../helpers/checkAnswer').checkAnswer;

const NUM_CLUES = 5;

// TODO: Make sure these times are where we want them
const SHOW_PRE_DECISION_TIME = 1;
const SHOW_DECISION_TIME = 1;
const SHOW_ANSWER_TIME = 1;
const SHOW_SCOREBOARD_TIME = 1;

app.use(express.static(path.join(__dirname, '../../build')));
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

const updateGameSession = (sessionName, key, value) => {
    if (!sessionCache.get(sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(sessionName);
    gameSession[key] = value;
    sessionCache.put(sessionName, gameSession);
};

const updateClients = (sessionName, socket) => {
    if (!sessionCache.get(sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(sessionName);
    let clients = gameSession.clients;

    clients.push(socket);
    gameSession.clients = clients;
    sessionCache.put(sessionName, gameSession);
};

const updatePlayers = (sessionName, socketId, key, value) => {
    let gameSession = sessionCache.get(sessionName);
    let players = gameSession.players;

    if (!players[socketId]) {
        players[socketId] = Object.create(Player);
        players[socketId].socketId = socketId;
    }

    players[socketId][key] = value;
    gameSession.players = players;
    sessionCache.put(sessionName, gameSession);
};

const updatePlayersAnswered = (sessionName, socketId) => {
    let gameSession = sessionCache.get(sessionName);

    let playersAnswered = gameSession.playersAnswered;
    playersAnswered.push(socketId);
    gameSession.playersAnswered = playersAnswered;

    sessionCache.put(sessionName, gameSession);
};

const updateCategories = (sessionName, categoryIndex, clueIndex) => {
    let gameSession = sessionCache.get(sessionName);

    let categories = gameSession.categories;

    categories[categoryIndex].clues[clueIndex].completed = true;
    categories[categoryIndex].numCluesUsed = categories[categoryIndex].numCluesUsed + 1;

    if (categories[categoryIndex].numCluesUsed === NUM_CLUES) {
        categories[categoryIndex].completed = true;
    }

    gameSession.categories = categories;

    sessionCache.put(sessionName, gameSession);
};

const handlePlayerDisconnection = (socket) => {
    // Only 'remember' this player if they've submitted their signature (AKA if there's something worth remembering)
    if (sessionCache.get(socket.sessionName).players[socket.id].name.length > 0) {
        disconnectionCache.put(socket.handshake.address, sessionCache.get(socket.sessionName).players[socket.id]);

        let gameSession = sessionCache.get(socket.sessionName);
        let players = gameSession.players;

        delete players[socket.id];

        // TODO: What if there aren't players left? Refresh the browser of course, but also... do we loop through
        //  all of the disconnections and get rid of the ones from this game? Is it worth it?

        gameSession.players = players;
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

        let players = gameSession.players;
        players[socket.id] = playerObject;
        gameSession.players = players;

        sessionCache.put(playerObject.sessionName, gameSession);

        socket.sessionName = playerObject.sessionName;

        disconnectionCache.del(socket.handshake.address);

        socket.emit('set_game_state', sessionCache.get(socket.sessionName).currentGameState, () => {
            socket.emit('reconnect');
        });
    }
};

const showBoard = (socket) => {
    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('set_game_state', GameState.BOARD, () => {
            // TODO: The client isn't hearing this emission once the acknowledgement comes back!
            io.to(socket.sessionName).emit('categories', sessionCache.get(socket.sessionName).categories);
            io.to(socket.sessionName).emit('board_controller', sessionCache.get(socket.sessionName).boardController);

            updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
        });
    });
};

const showClue = (socket, categoryIndex, clueIndex) => {
    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('set_game_state', GameState.CLUE, () => {
            io.to(socket.sessionName).emit('categories', sessionCache.get(socket.sessionName).categories);
            io.to(socket.sessionName).emit('request_clue', categoryIndex, clueIndex);
            io.to(socket.sessionName).emit('players_answered', sessionCache.get(socket.sessionName).playersAnswered);

            updateGameSession(socket.sessionName, 'currentGameState', GameState.CLUE);
        });
    });
};

const showScoreboard = (socket) => {
    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('set_game_state', GameState.SCOREBOARD, () => {
            io.to(socket.sessionName).emit('players', sessionCache.get(socket.sessionName).players);

            updateGameSession(socket.sessionName, 'currentGameState', GameState.SCOREBOARD);
        });
    });
};

io.on('connection', (socket) => {
    socket.emit('connect_device');

    socket.on('connect_device', (isMobile) => {
        socket.isMobile = isMobile;

        if (isMobile) {
            handlePlayerReconnection(socket);
        } else {
            let sessionName = randomWords({exactly: 1, maxLength: 5})[0];
            let session = Object.create(GameSession);

            socket.sessionName = sessionName;
            socket.join(sessionName);

            sessionCache.put(sessionName, session);
            updateClients(sessionName, socket);

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
            updateClients(sessionName, socket);

            updatePlayers(socket.sessionName, socket.id, 'sessionName', sessionName);

            if (!sessionCache.get(socket.sessionName).boardController) {
                updateGameSession(socket.sessionName, 'boardController', socket.id);
            }

            socket.emit('join_session_success', sessionName);
        } else {
            socket.emit('join_session_failure', sessionName);
        }
    });

    socket.on('submit_signature', (playerName) => {
        if (checkSignature(playerName)) {
            updatePlayers(socket.sessionName, socket.id, 'name', playerName);

            socket.emit('submit_signature_success');
        } else {
            socket.emit('submit_signature_failure');
        }
    });

    socket.on('start_game', () => {
        if (Object.keys(sessionCache.get(socket.sessionName).players).length > 0) {
            showBoard(socket);
        } else {
            socket.emit('start_game_failure');
        }
    });

    socket.on('request_clue', (categoryIndex, clueIndex) => {
        updateGameSession(socket.sessionName, 'categoryIndex', categoryIndex);
        updateGameSession(socket.sessionName, 'clueIndex', clueIndex);

        showClue(socket, categoryIndex, clueIndex);

        updateCategories(socket.sessionName, categoryIndex, clueIndex);
    });

    socket.on('buzz_in', () => {
        let categoryIndex = sessionCache.get(socket.sessionName).categoryIndex;
        let clueIndex = sessionCache.get(socket.sessionName).clueIndex;

        sessionCache.get(socket.sessionName).clients.map((client) => {
            client.emit('set_game_state', GameState.ANSWER, () => {
                io.to(socket.sessionName).emit('categories', sessionCache.get(socket.sessionName).categories);
                io.to(socket.sessionName).emit('request_clue', categoryIndex, clueIndex);

                updateGameSession(socket.sessionName, 'currentGameState', GameState.ANSWER);
            });
        });
    });

    socket.on('submit_answer', (answer) => {
        updatePlayersAnswered(socket.sessionName, socket.id);

        let categoryIndex = sessionCache.get(socket.sessionName).categoryIndex;
        let clueIndex = sessionCache.get(socket.sessionName).clueIndex;
        let correctAnswer = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].answer;
        let decision = checkAnswer(correctAnswer, answer);

        sessionCache.get(socket.sessionName).clients.map((client) => {
            client.emit('set_game_state', GameState.DECISION, () => {
                io.to(socket.sessionName).emit('decision', answer, decision);

                updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);
            });
        });

        setTimeout(() => {
            io.to(socket.sessionName).emit('show_decision');

            setTimeout(() => {
                if (decision) {
                    updateGameSession(socket.sessionName, 'boardController', socket.id);

                    showScoreboard(socket);

                    setTimeout(() => {
                        showBoard(socket);
                    }, SHOW_SCOREBOARD_TIME * 1000);
                } else if (sessionCache.get(socket.sessionName).playersAnswered.length === sessionCache.get(socket.sessionName).players.length) {
                    // TODO: This (and the other io.to broadcast are only going to the browser....
                    io.to(socket.sessionName).emit('show_answer');

                    setTimeout(() => {
                        showScoreboard(socket);

                        setTimeout(() => {
                            showBoard(socket);
                        }, SHOW_SCOREBOARD_TIME * 1000);
                    }, SHOW_ANSWER_TIME * 1000);
                } else {
                    showClue(socket, categoryIndex, clueIndex);
                }

                if (sessionCache.get(socket.sessionName).currentGameState === GameState.SCOREBOARD) {
                    updateGameSession(socket.sessionName, 'categoryIndex', null);
                    updateGameSession(socket.sessionName, 'clueIndex', null);
                    updateGameSession(socket.sessionName, 'playersAnswered', []);
                }
            }, SHOW_DECISION_TIME * 1000);
        }, SHOW_PRE_DECISION_TIME * 1000);
    });

    socket.on('disconnect', () => {
        if (sessionCache.get(socket.sessionName)) {
            if (socket.isMobile) {
                handlePlayerDisconnection(socket);
            } else {
                // TODO: Send out a broadcast for all of the players to go back to the lobby?
                sessionCache.del(socket.sessionName);
            }
        }
    });
});

server.listen(port);
