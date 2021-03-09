const removeAccents = require('remove-accents');

exports.formatRaw = (original) => {
    let rawAnswer = original.toLowerCase();

    // Remove accents
    rawAnswer = removeAccents(rawAnswer);

    // HTML tags
    rawAnswer = rawAnswer.replace(/<i>/g, "");
    rawAnswer = rawAnswer.replace("</i>", "");

    // Punctuation
    rawAnswer = rawAnswer.replace(/[.,\/#!$%\^&\*;:"'{}=\-_`~()]/g, " ");
    rawAnswer = rawAnswer.replace(/\s{2,}/g, " ");
    rawAnswer = rawAnswer.replace(String.fromCharCode(92), "");

    // Red words
    rawAnswer = rawAnswer.replace(/and /g, "");
    rawAnswer = rawAnswer.replace(/the /g, "");
    rawAnswer = rawAnswer.replace(/a /g, "");
    rawAnswer = rawAnswer.replace(/an /g, "");

    // Spacing
    rawAnswer = rawAnswer.replace(/ /g, "");

    // Edge cases
    rawAnswer = rawAnswer.replace(/v /g, "");
    rawAnswer = rawAnswer.replace(/v. /g, "");
    rawAnswer = rawAnswer.replace(/vs /g, "");
    rawAnswer = rawAnswer.replace(/vs. /g, "");

    return rawAnswer;
};
