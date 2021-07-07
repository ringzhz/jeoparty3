import say from './say';

export const sayBoardControllerFiller = (boardController) => {
    const text = `Select a clue, ${boardController}`;
    say(text);
};

export const sayDollarValueFiller = (dollarValue) => {
    const text = `Correct for ${dollarValue} dollars`;
    say(text);
};

export const sayCorrectAnswerFiller = (correctAnswer) => {
    const text = `The correct answer was ${correctAnswer}`;
    say(text);
};
