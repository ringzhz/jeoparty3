import say from './say';

export const sayJeopartyRoundFiller = (boardControllerName, onComplete) => {
    const text = `We'll begin with the Je-party round!`;
    say(text, () => {
        sayBoardControllerNameFiller(boardControllerName, onComplete);
    });
};

export const sayBoardControllerNameFiller = (boardControllerName, onComplete) => {
    const text = `Select a clue, ${boardControllerName}`;
    say(text, onComplete);
};

export const sayDollarValueFiller = (dollarValue) => {
    const text = `Correct for ${dollarValue}`;
    say(text);
};

export const sayCorrectAnswerFiller = (correctAnswer, onComplete) => {
    const text = `The correct answer was ${correctAnswer}`;
    say(text, onComplete);
};

export const sayBestStreakFiller = (playerName, streak, title, onComplete) => {
    const text = `${playerName} is on a ${streak} answer streak. You're a ${title}`;
    say(text, onComplete);
};
