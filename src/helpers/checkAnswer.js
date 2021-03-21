const wordsToNumbers = require('words-to-numbers').wordsToNumbers;

const ACRONYMS = require('../constants/acronyms').ACRONYMS;
const formatRaw = require('./format').formatRaw;

const MIN_ANSWER_LENGTH = 3;

exports.checkAnswer = (expected, actual) => {
    let rawExpected = formatRaw(wordsToNumbers(expected).toString());
    let rawActual = formatRaw(wordsToNumbers(actual).toString());

    // TODO: Consider what to do if the answer is included in the category and/or clue
    //  (important to consider categories like 'Mexico, Canada, or the USA' etc)

    // If expected answer is short (< 3 characters) then the actual answer can be short too
    let lengthLimit = rawExpected.length >= MIN_ANSWER_LENGTH ? MIN_ANSWER_LENGTH : 0;

    // If actual answer is a number then its length doesn't matter, otherwise it needs to respect the length limit
    let validLength = isNaN(rawActual) ? rawActual.length >= lengthLimit : true;

    let containsAnswer = rawExpected.includes(rawActual) || rawActual.includes(rawExpected);

    for (let acronym of Object.keys(ACRONYMS)) {
        let acronymArray = ACRONYMS[acronym];

        if (acronymArray.includes(rawExpected) && acronymArray.includes(rawActual)) {
            return true;
        }
    }

    return validLength && containsAnswer;
};
