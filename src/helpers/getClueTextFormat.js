const getClueTextCompressor = (textLength, mini=false) => {
    let compressor = null;

    if (textLength > 200) {
        compressor = mini ? 2 : 2.5;
    } else if (textLength > 100) {
        compressor = mini ? 1.75 : 2.25;
    } else {
        compressor = mini ? 1.5 : 2;
    }

    return compressor;
};

export { getClueTextCompressor };
