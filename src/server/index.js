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

const NUM_CATEGORIES = 6;
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
        players[socketId] = new Player();
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

    const value = 200 * (clueIndex + 1);
    updatedPlayers[socket.id].score = updatedPlayers[socket.id].score + (isCorrect ? value : -value);

    gameSession.updatedPlayers = updatedPlayers;
    sessionCache.put(socket.sessionName, gameSession);
};

const setPlayers = (sessionName) => {
    let gameSession = sessionCache.get(sessionName);

    if (Object.keys(gameSession.updatedPlayers).length > 0) {
        gameSession.players = _.cloneDeep(gameSession.updatedPlayers);
        gameSession.updatedPlayers = {};
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

    const gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.BOARD, () => {
            client.emit('categories', gameSession.categories);
            client.emit('is_board_controller', client.id === gameSession.boardController);
            client.emit('player', _.get(gameSession, `players[${client.id}]`));
        });
    });

    setPlayers(socket.sessionName);
    updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
};

const showClue = (socket, categoryIndex, clueIndex, clueText) => {
    const gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.CLUE, () => {
            client.emit('categories', gameSession.categories);
            client.emit('request_clue', categoryIndex, clueIndex, clueText);
            client.emit('players_answered', gameSession.playersAnswered);
            client.emit('player', _.get(gameSession, `players[${client.id}]`));
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.CLUE);
};

const startTimer = (socket) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    const session = sessionCache.get(socket.sessionName);
    const categoryIndex = session.categoryIndex;
    const clueIndex = session.clueIndex;

    sessionCache.get(socket.sessionName).browserClient.emit('start_timer');

    setTimeout(() => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const correctAnswer = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].answer;
        showCorrectAnswer(socket, correctAnswer, timeout=true);
    }, timers.BUZZ_IN_TIMEOUT * 1000);
};

const showCorrectAnswer = (socket, correctAnswer, timeout) => {
    const gameSession = sessionCache.get(socket.sessionName);

    if (timeout) {
        if (gameSession.buzzInTimeout) {
            gameSession.clients.map((client) => {
                client.emit('set_game_state', GameState.DECISION, () => {
                    client.emit('show_correct_answer', correctAnswer);
                    client.emit('player', _.get(gameSession, `players[${client.id}]`));
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
    }, timers.SHOW_CORRECT_ANSWER_TIME * 1000);
};

const showScoreboard = (socket) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    const gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.SCOREBOARD, () => {
            client.emit('players', gameSession.players);
            client.emit('updated_players', gameSession.updatedPlayers);
            client.emit('player', _.get(gameSession, `players[${client.id}]`));

            if (!_.isEqual(gameSession.players, gameSession.updatedPlayers)) {
                setTimeout(() => {
                    client.emit('show_update');
                }, timers.SHOW_SCOREBOARD_PRE_UPDATE_TIME * 1000);
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
            const sessionName = randomWords({exactly: 1, maxLength: 5})[0];
            let session = new GameSession();

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

    socket.on('submit_signature', (playerName, signature) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        if (checkSignature(playerName)) {
            updatePlayers(socket.sessionName, socket.id, 'name', playerName);
            updatePlayers(socket.sessionName, socket.id, 'signature', signature);

            socket.emit('submit_signature_success', _.get(sessionCache.get(socket.sessionName), `players[${socket.id}]`));
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

        io.to(socket.sessionName).emit('request_clue', categoryIndex, clueIndex);

        // TODO: Add this timeout to timer.js for use in BrowserBoard (this is for clue screen animation)
        setTimeout(() => {
            updateCategories(socket.sessionName, categoryIndex, clueIndex);
            setUpdatedPlayers(socket.sessionName);

            const clueText = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex].question;

            showClue(socket, categoryIndex, clueIndex, clueText);
        }, 1100);
    });

    socket.on('start_timer', () => {
        startTimer(socket);
    });

    socket.on('buzz_in', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updateGameSession(socket.sessionName, 'buzzInTimeout', false);

        const gameSession = sessionCache.get(socket.sessionName);
        const categoryIndex = gameSession.categoryIndex;
        const clueIndex = gameSession.clueIndex;

        gameSession.clients.map((client) => {
            client.emit('set_game_state', GameState.ANSWER, () => {
                client.emit('is_answering', client.id === socket.id);
                client.emit('categories', gameSession.categories);
                client.emit('request_clue', categoryIndex, clueIndex);
                client.emit('player', _.get(gameSession, `players[${socket.id}].name`));
                client.emit('player', _.get(gameSession, `players[${client.id}]`));
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

        const gameSession = sessionCache.get(socket.sessionName);
        const categoryIndex = gameSession.categoryIndex;
        const clueIndex = gameSession.clueIndex;
        const correctAnswer = gameSession.categories[categoryIndex].clues[clueIndex].answer;
        const isCorrect = checkAnswer(correctAnswer, answer);
        const price = 200 * (clueIndex + 1);

        updatePlayerScore(socket, clueIndex, isCorrect);

        gameSession.clients.map((client) => {
            client.emit('set_game_state', GameState.DECISION, () => {
                client.emit('show_answer', answer);
                client.emit('player', _.get(gameSession, `players[${client.id}]`));
            });
        });

        updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            io.to(socket.sessionName).emit('show_decision', isCorrect, price);

            setTimeout(() => {
                if (!sessionCache.get(socket.sessionName)) {
                    return;
                }

                if (isCorrect) {
                    updateGameSession(socket.sessionName, 'boardController', socket.id);
                    showCorrectAnswer(socket, correctAnswer, timeout=false);
                } else if (gameSession.playersAnswered.length === Object.keys(gameSession.players).length) {
                    showCorrectAnswer(socket, correctAnswer, timeout=false);
                } else {
                    showClue(socket, categoryIndex, clueIndex);
                    startTimer(socket);
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
