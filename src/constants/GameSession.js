const GameState = require('../constants/GameState').GameState;

exports.GameSession = {
    currentGameState: GameState.LOBBY,
    categories: [],
    players: {},
    playersAnswered: [],

    boardController: null,

    categoryIndex: null,
    clueIndex: null
};
