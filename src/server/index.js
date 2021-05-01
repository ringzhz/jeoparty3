const _ = require('lodash');
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

// in milliseconds
const SHOW_PRE_DECISION_TIME = 1000;
const SHOW_DECISION_TIME = 1000;
const SHOW_ANSWER_TIME = 1000;
const SHOW_SCOREBOARD_TIME = 9000;
const SHOW_SCOREBOARD_UPDATE_TIME = 3000;

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
        players[socketId].score = 0;
    }

    players[socketId][key] = value;
    gameSession.players = players;
    sessionCache.put(sessionName, gameSession);
};

const setUpdatedPlayers = (sessionName) => {
    let gameSession = sessionCache.get(sessionName);
    gameSession.updatedPlayers = _.cloneDeep(gameSession.players);
    sessionCache.put(sessionName, gameSession);
};

const updatePlayerScore = (sessionName, socketId, value, isCorrect) => {
    let gameSession = sessionCache.get(sessionName);
    let updatedPlayers = gameSession.updatedPlayers;

    updatedPlayers[socketId].score = updatedPlayers[socketId].score + (isCorrect ? value : -value);

    gameSession.updatedPlayers = updatedPlayers;
    sessionCache.put(sessionName, gameSession);
};

const setPlayers = (sessionName) => {
    let gameSession = sessionCache.get(sessionName);
    gameSession.players = _.cloneDeep(gameSession.updatedPlayers);
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
        const RECONNECT_WINDOW = 15 * 60 * 1000;
        disconnectionCache.put(socket.handshake.address, sessionCache.get(socket.sessionName).players[socket.id], RECONNECT_WINDOW);

        let gameSession = sessionCache.get(socket.sessionName);
        let players = gameSession.players;

        delete players[socket.id];

        if (Object.keys(players).length === 0) {
            gameSession.clients.map((client) => {
                client.disconnect();
            });

            gameSession.browserClient.disconnect(true);

            // TODO: Bug: server tries to reconnect players after this code fires (check normal DC as well)
        }

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

        let clients = gameSession.clients;
        clients.push(socket);
        gameSession.clients = clients;

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
            client.emit('categories', sessionCache.get(socket.sessionName).categories);
            client.emit('board_controller', sessionCache.get(socket.sessionName).boardController);
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
};

const showClue = (socket, categoryIndex, clueIndex) => {
    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('set_game_state', GameState.CLUE, () => {
            client.emit('categories', sessionCache.get(socket.sessionName).categories);
            client.emit('request_clue', categoryIndex, clueIndex);
            client.emit('players_answered', sessionCache.get(socket.sessionName).playersAnswered);
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.CLUE);
};

const showScoreboard = (socket) => {
    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('set_game_state', GameState.SCOREBOARD, () => {
            client.emit('players', sessionCache.get(socket.sessionName).players);
            client.emit('updated_players', sessionCache.get(socket.sessionName).updatedPlayers);

            setTimeout(() => {
                client.emit('show_update');
                setPlayers(socket.sessionName);
            }, SHOW_SCOREBOARD_UPDATE_TIME);
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.SCOREBOARD);
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
            updateGameSession(sessionName, 'browserClient', socket);
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

        setUpdatedPlayers(socket.sessionName);
    });

    socket.on('buzz_in', () => {
        let categoryIndex = sessionCache.get(socket.sessionName).categoryIndex;
        let clueIndex = sessionCache.get(socket.sessionName).clueIndex;

        sessionCache.get(socket.sessionName).clients.map((client) => {
            client.emit('set_game_state', GameState.ANSWER, () => {
                client.emit('categories', sessionCache.get(socket.sessionName).categories);
                client.emit('request_clue', categoryIndex, clueIndex);
            });
        });

        updateGameSession(socket.sessionName, 'currentGameState', GameState.ANSWER);
    });

    socket.on('submit_answer', (answer) => {
        updatePlayersAnswered(socket.sessionName, socket.id);

        let categoryIndex = sessionCache.get(socket.sessionName).categoryIndex;
        let clueIndex = sessionCache.get(socket.sessionName).clueIndex;
        let correctAnswer = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].answer;
        let value = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].value;
        let isCorrect = checkAnswer(correctAnswer, answer);

        updatePlayerScore(socket.sessionName, socket.id, value, isCorrect);

        sessionCache.get(socket.sessionName).clients.map((client) => {
            client.emit('set_game_state', GameState.DECISION, () => {
                client.emit('show_answer', answer);
            });
        });

        updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);

        setTimeout(() => {
            io.to(socket.sessionName).emit('show_decision', isCorrect);

            setTimeout(() => {
                if (isCorrect) {
                    updateGameSession(socket.sessionName, 'boardController', socket.id);

                    showScoreboard(socket);

                    setTimeout(() => {
                        showBoard(socket);
                    }, SHOW_SCOREBOARD_TIME);
                } else if (sessionCache.get(socket.sessionName).playersAnswered.length === Object.keys(sessionCache.get(socket.sessionName).players).length) {
                    io.to(socket.sessionName).emit('show_correct_answer', correctAnswer);

                    setTimeout(() => {
                        showScoreboard(socket);

                        setTimeout(() => {
                            showBoard(socket);
                        }, SHOW_SCOREBOARD_TIME);
                    }, SHOW_ANSWER_TIME);
                } else {
                    showClue(socket, categoryIndex, clueIndex);
                }

                if (sessionCache.get(socket.sessionName).currentGameState === GameState.SCOREBOARD) {
                    updateGameSession(socket.sessionName, 'categoryIndex', null);
                    updateGameSession(socket.sessionName, 'clueIndex', null);
                    updateGameSession(socket.sessionName, 'playersAnswered', []);
                }
            }, SHOW_DECISION_TIME);
        }, SHOW_PRE_DECISION_TIME);
    });

    socket.on('disconnect', () => {
        let gameSession = sessionCache.get(socket.sessionName);

        if (gameSession) {
            if (socket.isMobile) {
                handlePlayerDisconnection(socket);
            } else {
                gameSession.clients.map((client) => {
                    client.disconnect();
                });

                sessionCache.del(socket.sessionName);
            }
        }
    });
});

server.listen(port);
