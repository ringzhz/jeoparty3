import say from './say';

export const sayCategoryRevealFiller = (doubleJeoparty, onComplete) => {
    let text = '';

    if (doubleJeoparty) {
        text = `Here are the categories for double Je-party...`;
    } else {
        text = `Here are the categories...`;
    }

    say(text, onComplete);
};

export const sayRoundFiller = (boardControllerName, doubleJeoparty, onComplete) => {
    let text = '';

    if (doubleJeoparty) {
        text = `Let's get the double Je-party round started!`;
    } else {
        text = `We'll begin with the Je-party round!`;
    }

    say(text, () => {
        sayBoardControllerNameFiller(boardControllerName, onComplete);
    });
};

export const sayBoardControllerNameFiller = (boardControllerName, onComplete) => {
    const text = `Select a clue, ${boardControllerName}`;
    say(text, onComplete);
};

export const sayDailyDoubleFiller = () => {
    const text = `That's the daily double!`;
    say(text);
};

export const sayWagerFiller = (min, max, onComplete) => {
    const text = `Enter a wager between ${min} and ${max} dollars`;
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

export const sayFinalJeopartyCategoryRevealFiller = (onComplete) => {
    const text = `The final Je-party category is...`;
    say(text, onComplete);
};

export const sayFinalJeopartyWagerFiller = (onComplete) => {
    const text = `Enter a wager between 0 and your current net worth`;
    say(text, onComplete);
};
