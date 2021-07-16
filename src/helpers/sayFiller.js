import say from './say';

export const sayJeopartyRoundFiller = (boardControllerName) => {
    const text = `We'll begin with the Je-party round!`;
    say(text, () => {
        sayBoardControllerNameFiller(boardControllerName);
    });
};

export const sayBoardControllerNameFiller = (boardControllerName) => {
    const text = `Select a clue, ${boardControllerName}`;
    say(text);
};

export const sayDollarValueFiller = (dollarValue) => {
    const text = `Correct for ${dollarValue}`;
    say(text);
};

export const sayCorrectAnswerFiller = (correctAnswer) => {
    const text = `The correct answer was ${correctAnswer}`;
    say(text);
};

export const sayBestStreakFiller = (playerName, streak) => {
    const text = `${playerName} is on a ${streak} answer streak`;
    say(text);
};
