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
const titles = require('../constants/titles').titles;
const getRandomCategories = require('../helpers/jservice').getRandomCategories;
const checkSignature = require('../helpers/check').checkSignature;
const checkAnswer = require('../helpers/check').checkAnswer;
const formatRaw = require('../helpers/format').formatRaw;
const formatWager = require('../helpers/format').formatWager;

const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

app.use(express.static(path.join(__dirname, '../../build')));
app.get('/', (req, res, next) => res.sendFile(__dirname + './index.html'));

// Session cache helpers

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

const updatePlayer = (sessionName, socketId, key, value) => {
    if (!sessionCache.get(sessionName)) {
        return;
    }

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
    if (!sessionCache.get(sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(sessionName);
    gameSession.updatedPlayers = _.cloneDeep(gameSession.players);
    sessionCache.put(sessionName, gameSession);
};

const updatePlayerScore = (socket, value, isCorrect) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(socket.sessionName);
    let updatedPlayers = gameSession.updatedPlayers;

    updatedPlayers[socket.id].score = updatedPlayers[socket.id].score + (isCorrect ? value : -value);

    gameSession.updatedPlayers = updatedPlayers;
    sessionCache.put(socket.sessionName, gameSession);
};

const updatePlayerStreaks = (socket) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    const gameSession = sessionCache.get(socket.sessionName);

    for (let socketId of Object.keys(gameSession.players)) {
        const heat = gameSession.players[socketId];

        if (!gameSession.playersAnswered.includes(socketId)) {
            updatePlayer(socket.sessionName, socketId, 'heat', Math.min(0, heat - 1));

            if (heat - 1 === 0) {
                updatePlayer(socket.sessionName, socketId, 'streak', 0);
                updatePlayer(socket.sessionName, socket.id, 'title', '');
            }
        }
    }
};

const setPlayers = (sessionName) => {
    if (!sessionCache.get(sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(sessionName);

    if (_.size(gameSession.updatedPlayers) > 0) {
        gameSession.players = _.cloneDeep(gameSession.updatedPlayers);
        gameSession.updatedPlayers = {};
    }

    sessionCache.put(sessionName, gameSession);
};

const updatePlayersAnswered = (sessionName, socketId) => {
    if (!sessionCache.get(sessionName)) {
        return;
    }

    let gameSession = sessionCache.get(sessionName);

    let playersAnswered = gameSession.playersAnswered;
    playersAnswered.push(socketId);
    gameSession.playersAnswered = playersAnswered;

    sessionCache.put(sessionName, gameSession);
};

const updateCategories = (sessionName, categoryIndex, clueIndex) => {
    if (!sessionCache.get(sessionName)) {
        return;
    }

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
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    sessionCache.get(socket.sessionName).clients.map((client) => {
        client.emit('reload');
    });

    sessionCache.del(socket.sessionName);
};

const handlePlayerDisconnection = (socket) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    // Only 'remember' this player if they've submitted their signature
    if (sessionCache.get(socket.sessionName).players[socket.id].name.length > 0) {
        const RECONNECT_WINDOW = 15 * 60 * 1000;
        disconnectionCache.put(socket.handshake.address, sessionCache.get(socket.sessionName).players[socket.id], RECONNECT_WINDOW);

        let gameSession = sessionCache.get(socket.sessionName);
        let players = gameSession.players;

        delete players[socket.id];

        if (_.size(players) === 0) {
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

// Gameplay helpers

const checkBoardCompletion = (socket) => {
    const gameSession = sessionCache.get(socket.sessionName);

    for (let i = 0; i < NUM_CATEGORIES; i++) {
        for (let j = 0; j < NUM_CLUES; j++) {
            const clue = gameSession.categories[i].clues[j];

            if (!clue.completed) {
                return false;
            }
        }
    }

    if (gameSession.doubleJeoparty) {
        // All double jeoparty clues are completed, kick off final jeoparty
        return true;
    } else {
        // All clues are completed, reset for double jeoparty
        const doubleJeopartyCategories = gameSession.doubleJeopartyCategories;
        updateGameSession(socket.sessionName, 'categories', doubleJeopartyCategories);
        updateGameSession(socket.sessionName, 'doubleJeoparty', true);
        updateGameSession(socket.sessionName, 'boardRevealed', false);

        const sortedPlayers = _.cloneDeep(Object.values(gameSession.players).sort((a, b) => b.score - a.score));
        updateGameSession(socket.sessionName, 'boardController', gameSession.clients[sortedPlayers[-1].socketId]);
    }
};

const showBoard = (socket) => {
    const finalJeoparty = checkBoardCompletion(socket);

    if (finalJeoparty) {
        updateGameSession(socket.sessionName, 'finalJeoparty', true);
        showWager(socket);
        return;
    }

    const gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.BOARD, () => {
            client.emit('categories', gameSession.categories, gameSession.doubleJeoparty);
            client.emit('say_board_introduction', _.get(gameSession, `players[${gameSession.boardController.id}].name`), gameSession.boardRevealed, gameSession.categories, gameSession.doubleJeoparty);
            client.emit('is_board_controller', client.id === gameSession.boardController.id, gameSession.boardRevealed);
            client.emit('player', _.get(gameSession, `players[${client.id}]`));
        });
    });

    setPlayers(socket.sessionName);
    updateGameSession(socket.sessionName, 'currentGameState', GameState.BOARD);
};

const showWager = (socket) => {
    const gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.WAGER, () => {
            if (gameSession.finalJeoparty) {
                client.emit('final_jeoparty_clue', gameSession.finalJeopartyClue);
                client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
            } else {
                client.emit('board_controller', _.get(gameSession, `players[${gameSession.boardController.id}]`), gameSession.doubleJeoparty);
                client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
            }
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.WAGER);
};

const updatePlayerWager = (socket, wager) => {
    const gameSession = sessionCache.get(socket.sessionName);

    const score = _.get(gameSession, `players[${socket.id}].score`);
    const min = gameSession.finalJeoparty ? 0 : 5;
    const max = Math.max(score, gameSession.doubleJeoparty ? 2000 : 1000);
    updatePlayer(socket.sessionName, socket.id, 'wager', formatWager(wager, min, max));
};

const showClue = (socket, sayClueText) => {
    const gameSession = sessionCache.get(socket.sessionName);
    const clue = gameSession.finalJeoparty ? gameSession.finalJeopartyClue : gameSession.categories[gameSession.categoryIndex].clues[gameSession.clueIndex];

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.CLUE, () => {
            client.emit('request_clue', clue.question);
            client.emit('say_clue_text', clue.question, clue.dailyDouble || gameSession.finalJeoparty, sayClueText);
            client.emit('has_answered', clue.dailyDouble || gameSession.finalJeoparty || gameSession.playersAnswered.includes(client.id));
            client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.CLUE);
};

const buzzIn = (socket) => {
    updateGameSession(socket.sessionName, 'buzzInTimeout', false);

    const gameSession = sessionCache.get(socket.sessionName);
    const clue = gameSession.finalJeoparty ? gameSession.finalJeopartyClue : gameSession.categories[gameSession.categoryIndex].clues[gameSession.clueIndex];
    const categoryName = gameSession.finalJeoparty ? gameSession.finalJeopartyClue.categoryName : gameSession.categories[gameSession.categoryIndex].title;
    const dollarValue = gameSession.dailyDouble ? _.get(gameSession, `players[${socket.id}].wager`) : (gameSession.doubleJeoparty ? 400 : 200) * (gameSession.clueIndex + 1);

    const currentAnswersSubmitted = Object.keys(gameSession.players.filter((player) => {
        return player.score > 0 && player.finalJeopartyAnswerSubmitted;
    })).length;

    const totalAnswers = Object.keys(gameSession.players.filter((player) => {
        return player.score > 0;
    })).length;

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.ANSWER, () => {
            const score = _.get(gameSession, `players[${client.id}].score`) || 0;

            client.emit('request_clue', categoryName, clue.question, dollarValue, gameSession.finalJeoparty);
            client.emit('play_buzz_in_sound', clue.dailyDouble);
            client.emit('player_name', _.get(gameSession, `players[${socket.id}].name`));
            client.emit('answers_submitted', currentAnswersSubmitted, totalAnswers);
            client.emit('is_answering', gameSession.finalJeoparty ? score > 0 : client.id === socket.id);
            client.emit('player', _.get(gameSession, `players[${client.id}]`));
        });
    });

    updateGameSession(socket.sessionName, 'currentGameState', GameState.ANSWER);

    setTimeout(() => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        if (gameSession.finalJeoparty) {
            gameSession.clients.map((client) => {
                const score = _.get(gameSession, `players[${client.id}].score`) || 0;

                if (score > 0 && !_.get(gameSession, `players[${client.id}].finalJeopartyAnswerSubmitted`)) {
                    client.emit('answer_timeout', _.get(gameSession, `players[${client.id}].answer`));
                }
            });
        } else {
            socket.emit('answer_timeout', _.get(gameSession, `players[${socket.id}].answer`));
        }
    }, timers.ANSWER_TIMEOUT * 1000);
};

const startTimer = (socket) => {
    const session = sessionCache.get(socket.sessionName);

    io.to(socket.sessionName).emit('start_timer');

    setTimeout(() => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const correctAnswer = sessionCache.get(socket.sessionName).categories[session.categoryIndex].clues[session.clueIndex].answer;
        showCorrectAnswer(socket, correctAnswer, true, true);
    }, timers.BUZZ_IN_TIMEOUT * 1000);
};

const showFinalJeopartyDecision = (socket) => {
    const gameSession = sessionCache.get(socket.sessionName);

    const totalAnswers = Object.keys(gameSession.updatedPlayers.filter((player) => {
        return player.score > 0;
    })).length;

    const sortedPlayers = _.cloneDeep(gameSession.updatedPlayers.filter((player) => {
        return player.score > 0;
    }).sort((a, b) => {
        return a.name.localeCompare(b.name);
    }));

    if (gameSession.finalJeopartyDecisionIndex < totalAnswers) {
        const player = sortedPlayers[gameSession.finalJeopartyDecisionIndex];

        if (gameSession.finalJeopartyDecisionIndex === 0) {
            gameSession.clients.map((client) => {
                client.emit('set_game_state', GameState.DECISION, () => {
                    client.emit('show_answer', player.answer);
                    client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
                });
            });
        } else {
            gameSession.browserClient.emit('show_answer', player.answer);
        }

        updateGameSession(socket.sessionName, 'finalJeopartyDecisionIndex', gameSession.finalJeopartyDecisionIndex + 1);

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            const isCorrect = checkAnswer(gameSession.finalJeopartyClue.categoryName, gameSession.finalJeopartyClue.question, gameSession.finalJeopartyClue.answer, player.answer);

            gameSession.browserClient.emit('show_decision', isCorrect, player.wager);
        }, timers.SHOW_PRE_DECISION_TIME * 1000);
    } else {
        showCorrectAnswer(socket, gameSession.finalJeopartyClue.answer, false, true);
    }
};

const showCorrectAnswer = (socket, correctAnswer, timeout, sayCorrectAnswer) => {
    const gameSession = sessionCache.get(socket.sessionName);

    if (timeout) {
        // TODO: Where else are there timeouts declared in the game session object and how are they used?
        if (gameSession.buzzInTimeout) {
            gameSession.clients.map((client) => {
                client.emit('set_game_state', GameState.DECISION, () => {
                    client.emit('show_correct_answer', correctAnswer, sayCorrectAnswer, true);
                    client.emit('player', _.get(gameSession, `players[${client.id}]`));
                });
            });

            updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);
        }
    } else {
        gameSession.browserClient.emit('show_correct_answer', correctAnswer, sayCorrectAnswer, false);

        if (!sayCorrectAnswer) {
            setTimeout(() => {
                if (!sessionCache.get(socket.sessionName)) {
                    return;
                }

                showScoreboard(socket);
            }, timers.SHOW_CORRECT_ANSWER_TIME * 1000);
        }
    }
};

const showScoreboard = (socket) => {
    if (!sessionCache.get(socket.sessionName)) {
        return;
    }

    updatePlayerStreaks(socket);

    const gameSession = sessionCache.get(socket.sessionName);

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.SCOREBOARD, () => {
            client.emit('players', gameSession.players);
            client.emit('updated_players', gameSession.updatedPlayers);
            client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));

            if (!_.isEqual(gameSession.players, gameSession.updatedPlayers)) {
                setTimeout(() => {
                    client.emit('show_update');
                    client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
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

const showPodium = (socket) => {
    const gameSession = sessionCache.get(socket.sessionName);
    const champion = Object.values(gameSession.updatedPlayers).sort((a, b) => b.score - a.score)[0];

    gameSession.clients.map((client) => {
        client.emit('set_game_state', GameState.PODIUM, () => {
            client.emit('champion', champion);
            client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
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
            const sessionName = randomWords({exactly: 1, maxLength: 5})[0];
            let session = new GameSession();

            socket.sessionName = sessionName;
            socket.join(sessionName);

            sessionCache.put(sessionName, session);
            updateGameSession(sessionName, 'browserClient', socket);
            updateClients(sessionName, socket);

            socket.emit('session_name', sessionName);

            getRandomCategories((categories, doubleJeopartyCategories, finalJeopartyClue) => {
                updateGameSession(socket.sessionName, 'categories', categories);
                updateGameSession(socket.sessionName, 'doubleJeopartyCategories', doubleJeopartyCategories);
                updateGameSession(socket.sessionName, 'finalJeopartyClue', finalJeopartyClue);
            });
        }
    });

    socket.on('unmute', () => {
        socket.emit('unmute');
    });

    socket.on('join_session', (sessionName) => {
        sessionName = formatRaw(sessionName);

        if (sessionCache.get(sessionName)) {
            socket.sessionName = sessionName;
            socket.join(sessionName);
            updateClients(sessionName, socket);

            updatePlayer(socket.sessionName, socket.id, 'sessionName', sessionName);

            if (!sessionCache.get(socket.sessionName).boardController) {
                updateGameSession(socket.sessionName, 'boardController', socket);
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
            updatePlayer(socket.sessionName, socket.id, 'name', playerName);
            updatePlayer(socket.sessionName, socket.id, 'signature', signature);

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

        if (_.size(sessionCache.get(socket.sessionName).players) > 0) {
            socket.emit('start_game_success');
            showBoard(socket);
        } else {
            socket.emit('start_game_failure');
        }
    });

    socket.on('board_revealed', () => {
        updateGameSession(socket.sessionName, 'boardRevealed', true);
        io.to(socket.sessionName).emit('board_revealed');
    });

    socket.on('request_clue', (categoryIndex, clueIndex) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updateGameSession(socket.sessionName, 'categoryIndex', categoryIndex);
        updateGameSession(socket.sessionName, 'clueIndex', clueIndex);

        const clue = sessionCache.get(socket.sessionName).categories[categoryIndex].clues[clueIndex];

        io.to(socket.sessionName).emit('request_clue', categoryIndex, clueIndex, clue.dailyDouble);

        updateCategories(socket.sessionName, categoryIndex, clueIndex);
        setUpdatedPlayers(socket.sessionName);

        if (clue.dailyDouble) {
            setTimeout(() => {
                if (!sessionCache.get(socket.sessionName)) {
                    return;
                }

                showWager(socket);
            }, timers.SHOW_DAILY_DOUBLE_ANIMATION * 1000);
        } else {
            setTimeout(() => {
                if (!sessionCache.get(socket.sessionName)) {
                    return;
                }

                showClue(socket, true);
            }, (timers.SHOW_CLUE_ANIMATION * 1000) + 100);
        }
    });

    socket.on('start_timer', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        startTimer(socket);
    });

    socket.on('start_wager_timer', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        gameSession.browserClient.emit('start_wager_timer');

        if (gameSession.finalJeoparty) {
            let totalWagers = 0;

            gameSession.clients.map((client) => {
                const score = _.get(gameSession, `players[${client.id}].score`) || 0;

                if (score > 0) {
                    client.emit('is_wagering', score > 0);
                    totalWagers++;
                }
            });

            gameSession.browserClient('wagers_submitted', 0, totalWagers);
        } else {
            // Daily double
            gameSession.boardController.emit('is_wagering', true);
        }

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            const gameSession = sessionCache.get(socket.sessionName);

            if (gameSession.finalJeoparty) {
                gameSession.clients.map((client) => {
                    const score = _.get(gameSession, `players[${client.id}].score`) || 0;

                    if (score > 0 && !_.get(gameSession, `players[${client.id}].finalJeopartyWagerSubmitted`)) {
                        client.emit('wager_timeout', _.get(gameSession, `players[${client.id}].wager`));
                    }
                });
            } else {
                // Daily double
                gameSession.boardController.emit('wager_timeout', _.get(gameSession, `players[${gameSession.boardController.id}].wager`));
            }
        }, timers.WAGER_TIMEOUT * 1000);
    });

    socket.on('wager_livefeed', (wagerLivefeed) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updatePlayerWager(socket, wagerLivefeed);
        sessionCache.get(socket.sessionName).browserClient.emit('wager_livefeed', wagerLivefeed);
    });

    socket.on('submit_wager', (wager) => {
        if (!sessionCache.get(socket.sessionName) || sessionCache.get(socket.sessionName).currentGameState !== GameState.WAGER) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        updatePlayerWager(socket, wager);

        if (gameSession.finalJeoparty) {
            updatePlayer(socket.sessionName, socket.id, 'finalJeopartyWagerSubmitted', true);

            const currentWagersSubmitted = Object.keys(gameSession.players.filter((player) => {
                return player.score > 0 && player.finalJeopartyWagerSubmitted;
            })).length;

            const totalWagers = Object.keys(gameSession.players.filter((player) => {
                return player.score > 0;
            })).length;

            if (currentWagersSubmitted === totalWagers) {
                showClue(socket, true);
            } else {
                gameSession.browserClient.emit('wagers_submitted', currentWagersSubmitted, totalWagers);
            }
        } else {
            showClue(socket, true);
        }
    });

    socket.on('wager_buzz_in', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        buzzIn(gameSession.boardController);
    });

    socket.on('buzz_in', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        buzzIn(socket);
    });

    socket.on('answer_livefeed', (answerLivefeed) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        updatePlayer(socket.sessionName, socket.id, 'answer', answerLivefeed);
        sessionCache.get(socket.sessionName).browserClient.emit('answer_livefeed', answerLivefeed);
    });

    socket.on('submit_answer', (answer, timeout) => {
        if (!sessionCache.get(socket.sessionName) || sessionCache.get(socket.sessionName).currentGameState !== GameState.ANSWER) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        const categoryName = gameSession.categories[gameSession.categoryIndex].title;
        const clue = gameSession.categories[gameSession.categoryIndex].clues[gameSession.clueIndex];

        const isCorrect = checkAnswer(categoryName, clue.question, clue.answer, answer);
        const dollarValue = clue.dailyDouble || gameSession.finalJeoparty ? _.get(gameSession, `players[${socket.id}].wager`) : (gameSession.doubleJeoparty ? 400 : 200) * (gameSession.clueIndex + 1);

        updatePlayersAnswered(socket.sessionName, socket.id);
        updatePlayerScore(socket, dollarValue, isCorrect);

        if (gameSession.finalJeoparty) {
            updatePlayer(socket.sessionName, socket.id, 'finalJeopartyAnswerSubmitted', true);
            updatePlayer(socket.sessionName, socket.id, 'answer', answer);

            const currentAnswersSubmitted = Object.keys(gameSession.players.filter((player) => {
                return player.score > 0 && player.finalJeopartyAnswerSubmitted;
            })).length;

            const totalAnswers = Object.keys(gameSession.players.filter((player) => {
                return player.score > 0;
            })).length;

            if (currentAnswersSubmitted === totalAnswers && timeout) {
                showFinalJeopartyDecision(socket);
            } else {
                gameSession.browserClient.emit('answers_submitted', currentAnswersSubmitted, totalAnswers);
            }

            return;
        }

        updatePlayer(socket.sessionName, socket.id, 'answer', '');

        const player = _.get(gameSession, `players[${socket.id}]`);

        if (isCorrect) {
            updatePlayer(socket.sessionName, socket.id, 'streak', player.streak + 1);
            updatePlayer(socket.sessionName, socket.id, 'heat', 2);
            updatePlayer(socket.sessionName, socket.id, 'title', titles[player.streak + 1]);
        } else {
            updatePlayer(socket.sessionName, socket.id, 'streak', 0);
            updatePlayer(socket.sessionName, socket.id, 'heat', 0);
            updatePlayer(socket.sessionName, socket.id, 'title', '');
        }

        gameSession.clients.map((client) => {
            client.emit('set_game_state', GameState.DECISION, () => {
                client.emit('show_answer', answer);
                client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
            });
        });

        updateGameSession(socket.sessionName, 'currentGameState', GameState.DECISION);

        setTimeout(() => {
            if (!sessionCache.get(socket.sessionName)) {
                return;
            }

            gameSession.browserClient.emit('show_decision', isCorrect, dollarValue);
            gameSession.clients.map((client) => {
                client.emit('player', _.get(gameSession, `updatedPlayers[${client.id}]`));
            });
        }, timers.SHOW_PRE_DECISION_TIME * 1000);
    });

    socket.on('show_decision', (isCorrect) => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        if (gameSession.finalJeoparty) {
            showFinalJeopartyDecision(socket);
        } else {
            const clue = gameSession.categories[gameSession.categoryIndex].clues[gameSession.clueIndex];

            if (isCorrect) {
                updateGameSession(socket.sessionName, 'boardController', socket);
                showCorrectAnswer(socket, clue.answer, false, false);
            } else if (_.size(gameSession.playersAnswered) === _.size(gameSession.players) || clue.dailyDouble) {
                showCorrectAnswer(socket, clue.answer, false, true);
            } else {
                showClue(socket, false);
                startTimer(socket);
            }
        }
    });

    socket.on('show_board', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        showBoard(socket);
    });

    socket.on('show_scoreboard', () => {
        if (!sessionCache.get(socket.sessionName)) {
            return;
        }

        const gameSession = sessionCache.get(socket.sessionName);

        if (gameSession.finalJeoparty) {
            showPodium(socket);
        } else {
            showScoreboard(socket);
        }
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
