const removeAccents = require('remove-accents');

exports.formatRaw = (original) => {
    let rawOriginal = original.toLowerCase();

    // Remove accents
    rawOriginal = removeAccents(rawOriginal);

    // HTML tags
    rawOriginal = rawOriginal.replace(/<i>/g, "");
    rawOriginal = rawOriginal.replace("</i>", "");

    // Punctuation
    rawOriginal = rawOriginal.replace(/[.,\/#!$%\^&\*;:"'{}=\-_`~()]/g, "");
    rawOriginal = rawOriginal.replace(/\s{2,}/g, "");
    rawOriginal = rawOriginal.replace(String.fromCharCode(92), "");

    // Red words
    rawOriginal = rawOriginal.replace(/and /g, "");
    rawOriginal = rawOriginal.replace(/the /g, "");
    rawOriginal = rawOriginal.replace(/a /g, "");
    rawOriginal = rawOriginal.replace(/an /g, "");

    // Spacing
    rawOriginal = rawOriginal.replace(/ /g, "");

    // Edge cases
    rawOriginal = rawOriginal.replace(/v /g, "");
    rawOriginal = rawOriginal.replace(/v. /g, "");
    rawOriginal = rawOriginal.replace(/vs /g, "");
    rawOriginal = rawOriginal.replace(/vs. /g, "");

    return rawOriginal;
};

exports.formatUtterance = (original) => {
    let rawOriginal = original.toLowerCase();

    rawOriginal = rawOriginal.replace(/_+/g, 'blank');
    rawOriginal = rawOriginal.replace(/\.+/g, ',');

    return rawOriginal;
};

exports.formatCategory = (category) => {
    const NUM_CLUES = 5;

    for (let i = 0; i < NUM_CLUES; i++) {
        let question = category.clues[i].question;

        // Backslashes
        question = question.replace(String.fromCharCode(92), "");

        // HTML tags
        question = question.replace(/<I>/g, "");
        question = question.replace("</I>", "");

        // Parentheses and the text inside of them
        question = question.replace(/ *\([^)]*\) */g, "");

        category.clues[i].question = question;
    }

    return category;
};
