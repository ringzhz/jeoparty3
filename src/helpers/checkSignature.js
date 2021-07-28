exports.checkSignature = (playerName) => {
    return playerName.length > 0 && playerName.length < 20;
};
