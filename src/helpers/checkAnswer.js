const wordsToNumbers = require('words-to-numbers').wordsToNumbers;

const ACRONYMS = require('../constants/acronyms').ACRONYMS;
const formatRaw = require('./format').formatRaw;

exports.checkAnswer = (expected, actual) => {
    let rawExpected = formatRaw(wordsToNumbers(expected).toString());
    let rawActual = formatRaw(wordsToNumbers(actual).toString());

    // If expected answer is short (< 3 characters) then the actual answer can be short too
    let lengthLimit = rawExpected.length >= 3 ? 3 : 0;

    // If actual answer is a number then its length doesn't matter, otherwise it needs to follow the length limit
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
