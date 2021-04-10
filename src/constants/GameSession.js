const GameState = require('../constants/GameState').GameState;

exports.GameSession = {
    browserClient: null,
    clients: [],

    currentGameState: GameState.LOBBY,
    categories: [],
    players: {},
    playersAnswered: [],

    boardController: null,

    categoryIndex: null,
    clueIndex: null
};
