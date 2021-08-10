import _ from 'lodash';
import say from './say';

const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getQuotedWords = (text) => {
    let quotedWords = [];
    let currentWord = '';
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];

        if (c === `"`) {
            if (insideQuote) {
                quotedWords.push(currentWord);
                currentWord = '';
                insideQuote = false;
            } else {
                insideQuote = true;
            }
        } else if (insideQuote) {
            currentWord += c;
        }
    }

    return quotedWords;
};

export const sayCategoryRevealIntroductionFiller = (doubleJeoparty, onComplete) => {
    const doubleJeopartyOptions = [
        `Here are the categories for double Je-party...`
    ];

    const jeopartyOptions = [
        `Here are the categories...`
    ];

    const text = doubleJeoparty ? choice(doubleJeopartyOptions) : choice(jeopartyOptions);
    say(text, onComplete);
};

export const sayCategoryRevealFiller = (categoryName, onComplete) => {
    const quotedWords = getQuotedWords(categoryName);
    const options = [
        `with ${quotedWords.join(' and ')} in quotations`
    ];
    const quotedWordsText = !_.isEmpty(quotedWords) ? choice(options) : '';

    const text = categoryName + quotedWordsText;
    say(text, onComplete);
};

export const sayRoundFiller = (boardControllerName, doubleJeoparty, onComplete) => {
    const doubleJeopartyOptions = [
        `Let's get the double Je-party round started!`
    ];

    const jeopartyOptions = [
        `We'll begin with the Je-party round!`
    ];

    const text = doubleJeoparty ? choice(doubleJeopartyOptions) : choice(jeopartyOptions);
    say(text, () => {
        sayBoardControllerNameFiller(boardControllerName, onComplete);
    });
};

export const sayBoardControllerNameFiller = (boardControllerName, onComplete) => {
    const options = [
        `Select a clue, ${boardControllerName}`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayDailyDoubleFiller = () => {
    const options = [
        `That's the daily double!`
    ];

    const text = choice(options);
    say(text);
};

export const sayWagerFiller = (min, max, onComplete) => {
    const options = [
        `Enter a wager between ${min} and ${max} dollars`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayDollarValueFiller = (dollarValue, onComplete) => {
    const options = [
        `Correct for ${dollarValue}`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayCorrectAnswerFiller = (correctAnswer, onComplete) => {
    const options = [
        `The correct answer was ${correctAnswer}`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayBestStreakFiller = (playerName, streak, title, onComplete) => {
    const options = [
        `${playerName} is on a ${streak} answer streak. You're a ${title}`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayFinalJeopartyCategoryRevealIntroductionFiller = (onComplete) => {
    const options = [
        `The final Je-party category is...`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayFinalJeopartyWagerFiller = (onComplete) => {
    const options = [
        `Enter a wager between 0 and your current net worth`
    ];

    const text = choice(options);
    say(text, onComplete);
};

export const sayChampionIntroductionFiller = (onComplete) => {
    const options = [
        `And today's Je-party champion is...`
    ];

    const text = choice(options);
    say(text, onComplete);
};