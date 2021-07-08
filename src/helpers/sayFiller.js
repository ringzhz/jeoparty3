import say from './say';

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
