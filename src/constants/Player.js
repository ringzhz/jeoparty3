function Player() {
    this.socketId = '';
    this.sessionName = '';
    this.joinIndex = 0;
    this.name = '';
    this.signature = '';
    this.oldScore = 0;
    this.score = 0;
    this.wager = 0;
    this.finalJeopartyWagerSubmitted = false;
    this.finalJeopartyAnswerSubmitted = false;
    this.answer = '';
    this.streak = 0;
    this.heat = 0;
    this.title = 0;
}

exports.Player = Player;
