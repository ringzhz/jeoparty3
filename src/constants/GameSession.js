const GameState = require('../constants/GameState').GameState;

exports.GameSession = {
    currentGameState: GameState.LOBBY,
    players: {},
    categories: []
};
