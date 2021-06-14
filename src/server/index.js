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

const timers = require('../constants/timers').timers;
const getRandomCategories = require('../helpers/jservice').getRandomCategories;
const checkSignature = require('../helpers/checkSignature').checkSignature;
const checkAnswer = require('../helpers/checkAnswer').checkAnswer;
const formatRaw = require('../helpers/format').formatRaw;

const NUM_CLUES = 5;

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

const updatePlayerScore = (socket, clueIndex, isCorrect) => {
    let gameSession = sessionCache.get(socket.sessionName);
    let updatedPlayers = gameSession.updatedPlayers;

    let value = 200 * (clueIndex + 1);
    updatedPlayers[socket.id].score = updatedPlayers[socket.id].score + (isCorrect ? value : -value);

    gameSession.updatedPlayers = updatedPlayers;
    sessionCache.put(socket.sessionName, gameSession);
};

const setPlayers = (sessionName) => {
    let gameSession = sessionCache.get(sessionName);

    if (Object.keys(gameSession.updatedPlayers).length > 0) {
        gameSession.players = _.cloneDeep(gameSession.updatedPlayers);
    }

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

const handleBrowserDisconnection = (socket) => {
    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('reload');
    });

    sessionCache.del(socket.sessionName);
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
            gameSession.browserClient.disconnect(true);
            return;
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
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.BOARD, () => {
            client.emit('categories', gameSession.categories);
            client.emit('is_board_controller', client.id === gameSession.boardController);
        });
    });

    setPlayers(socket.sessionName);
    updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
};

const showClue = (socket, categoryIndex, clueIndex) => {
    let gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.CLUE, () => {
            client.emit('categories', gameSession.categories);
            client.emit('request_clue', categoryIndex, clueIndex);
            client.emit('players_answered', gameSession.playersAnswered);
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.CLUE);
};

const showCorrectAnswer = (socket, correctAnswer, timeout) => {
    if (timeout) {
        if (sessionCache.get(socket.sessionName).buzzInTimeout) {
            sessionCache.get(socket.sessionName).clients.map((client) => {
                client.emit('set_game_state', GameState.DECISION, () => {
                    client.emit('show_correct_answer', correctAnswer);
                });
            });

            updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);
        } else {
            return;
        }
    } else {
        io.to(socket.sessionName).emit('show_correct_answer', correctAnswer);
    }

    setTimeout(() => {
        showScoreboard(socket);

        setTimeout(() => {
            showBoard(socket);
        }, timers.SHOW_SCOREBOARD_TIME * 1000);
    }, timers.SHOW_DECISION_TIME * 1000);
};

const showScoreboard = (socket) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.SCOREBOARD, () => {
            client.emit('players', gameSession.players);
            client.emit('updated_players', gameSession.updatedPlayers);

            if (!_.isEqual(gameSession.players, gameSession.updatedPlayers)) {
                setTimeout(() => {
                    client.emit('show_update');
                }, timers.SHOW_SCOREBOARD_UPDATE_TIME * 1000);
            }
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.SCOREBOARD);

    updateGameSession(socket.sessionName, 'categoryIndex', null);
    updateGameSession(socket.sessionName, 'clueIndex', null);
    updateGameSession(socket.sessionName, 'playersAnswered', []);
    updateGameSession(socket.sessionName, 'buzzInTimeout', true);
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
        sessionName = formatRaw(sessionName);

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
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        if (checkSignature(playerName)) {
            updatePlayers(socket.sessionName, socket.id, 'name', playerName);

            socket.emit('submit_signature_success');
            sessionCache.get(socket.sessionName).browserClient.emit('new_player_name', playerName);
        } else {
            socket.emit('submit_signature_failure');
        }
    });

    socket.on('start_game', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        if (Object.keys(sessionCache.get(socket.sessionName).players).length > 0) {
            showBoard(socket);
        } else {
            socket.emit('start_game_failure');
        }
    });

    socket.on('request_clue', (categoryIndex, clueIndex) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updateGameSession(socket.sessionName, 'categoryIndex', categoryIndex);
        updateGameSession(socket.sessionName, 'clueIndex', clueIndex);

        showClue(socket, categoryIndex, clueIndex);

        updateCategories(socket.sessionName, categoryIndex, clueIndex);

        setUpdatedPlayers(socket.sessionName);

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            let correctAnswer = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].answer;
            showCorrectAnswer(socket, correctAnswer, timeout=true);
        }, timers.BUZZ_IN_TIMEOUT * 1000);
    });

    socket.on('buzz_in', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updateGameSession(socket.sessionName, 'buzzInTimeout', false);

        let gameSession = sessionCache.get(socket.sessionName);
        let categoryIndex = gameSession.categoryIndex;
        let clueIndex = gameSession.clueIndex;

        gameSession.clients.map((client) => {
            client.emit('set_game_state', GameState.ANSWER, () => {
                client.emit('is_answering', client.id === socket.id);
                client.emit('categories', gameSession.categories);
                client.emit('request_clue', categoryIndex, clueIndex);
                client.emit('player_name', gameSession.players[socket.id].name);
            });
        });

        updateGameSession(socket.sessionName, 'currentGameState', GameState.ANSWER);

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            socket.emit('answer_timeout', sessionCache.get(socket.sessionName).players[socket.id].answer);
        }, timers.ANSWER_TIMEOUT * 1000);
    });

    socket.on('answer_livefeed', (answerLivefeed) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updatePlayers(socket.sessionName, socket.id, 'answer', answerLivefeed);
        sessionCache.get(socket.sessionName).browserClient.emit('answer_livefeed', answerLivefeed);
    });

    socket.on('submit_answer', (answer) => {
        if (!sessionCache.get(socket.sessionName) || sessionCache.get(socket.sessionName).currentGameState !== GameState.ANSWER) {
            return;
        }

        updatePlayersAnswered(socket.sessionName, socket.id);
        updatePlayers(socket.sessionName, socket.id, 'answer', '');

        let gameSession = sessionCache.get(socket.sessionName);
        let categoryIndex = gameSession.categoryIndex;
        let clueIndex = gameSession.clueIndex;
        let correctAnswer = gameSession.categories[categoryIndex].clues[clueIndex].answer;
        let isCorrect = checkAnswer(correctAnswer, answer);
        let price = 200 * (clueIndex + 1);

        updatePlayerScore(socket, clueIndex, isCorrect);

        updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            io.to(socket.sessionName).emit('show_decision', correctAnswer, isCorrect, price);

            setTimeout(() => {
                if (!sessionCache.get(socket.sessionName)) {
                    return;
                }

                if (isCorrect) {
                    updateGameSession(socket.sessionName, 'boardController', socket.id);

                    showScoreboard(socket);

                    setTimeout(() => {
                        showBoard(socket);
                    }, timers.SHOW_SCOREBOARD_TIME * 1000);
                } else if (gameSession.playersAnswered.length === Object.keys(gameSession.players).length) {
                    showCorrectAnswer(socket, correctAnswer, timeout=false);
                } else {
                    showClue(socket, categoryIndex, clueIndex);
                }
            }, timers.SHOW_DECISION_TIME * 1000);
        }, timers.SHOW_PRE_DECISION_TIME * 1000);
    });

    socket.on('disconnect', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        if (socket.isMobile) {
            handlePlayerDisconnection(socket);
        } else {
            handleBrowserDisconnection(socket);
        }
    });
});

server.listen(port);
