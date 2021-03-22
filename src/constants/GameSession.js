const GameState = require('../constants/GameState').GameState;

exports.GameSession = {
    clients: [],

    currentGameState: GameState.LOBBY,
    categories: [],
    players: {},
    playersAnswered: [],

    boardController: null,

    categoryIndex: null,
    clueIndex: null
};
