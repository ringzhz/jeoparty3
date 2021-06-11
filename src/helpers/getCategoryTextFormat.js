const getCategoryTextLineHeight = (textLength) => {
    let lineHeight = null;

    if (textLength > 20) {
        lineHeight = '1.5em';
    } else if (textLength > 10) {
        lineHeight = '2em';
    } else {
        lineHeight = '2.5em';
    }

    return lineHeight;
};

const getCategoryTextCompressor = (textLength, mini=false) => {
    let compressor = null;

    if (textLength > 20) {
        compressor = mini ? 1 : 0.75;
    } else if (textLength > 10) {
        compressor = mini ? 0.75 : 0.5;
    } else {
        compressor = 0.5;
    }

    console.log(`textLength (${textLength}) has compressor (${compressor})`);

    return compressor;
};

export { getCategoryTextLineHeight, getCategoryTextCompressor };
