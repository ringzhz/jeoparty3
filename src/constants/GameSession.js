const GameState = require('../constants/GameState').GameState;

function GameSession() {
    this.browserClient = null;
    this.clients = [];

    this.currentGameState = GameState.LOBBY;
    this.doubleJeoparty = false;
    this.finalJeoparty = false;
    this.boardRevealed = false;

    this.categories = [];
    this.doubleJeopartyCategories = [];
    this.finalJeopartyClue = {};

    this.players = {};
    this.updatedPlayers = {};
    this.playersAnswered = [];
    this.boardController = null;

    this.categoryIndex = null;
    this.clueIndex = null;

    this.buzzInTimeout = true;
}

exports.GameSession = GameSession;
