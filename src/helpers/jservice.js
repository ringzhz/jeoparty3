const js = require('jservice-node');
const formatRaw = require('./format').formatRaw;

const MAX_CATEGORY_ID = 18418;
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

const getRandomCategory = (cb) => {
    let categoryId = Math.floor(Math.random() * MAX_CATEGORY_ID) + 1;

    js.category(categoryId, (error, response, category) => {
        if (!error && response.statusCode === 200) {
            let cluesCount = category['clues_count'];
            let startingIndex = Math.round((Math.random() * (cluesCount - 5)) / 5) * 5;
            category['clues'] = category['clues'].slice(startingIndex, startingIndex + 5);

            if (approveCategory(category)) {
                cb(error, category);
            } else {
                cb(true, category);
            }
        } else {
            console.log(`Error: ${response.statusCode}`);
            cb(true, category);
        }
    });
};

const approveCategory = (category) => {
    let rawCategoryTitle = formatRaw(category['title']);
    let isMediaCategory = rawCategoryTitle.includes('logo') || rawCategoryTitle.includes('video');

    for (let i = 0; i < NUM_CLUES; i++) {
        let clue = category['clues'][i];
        let rawQuestion = formatRaw(clue['question']);

        let isValid = rawQuestion.length > 0 && clue['invalid_count'] === null;
        let isMediaQuestion =
            rawQuestion.includes('seenhere') ||
            rawQuestion.includes('heardhere') ||
            rawQuestion.includes('video');

        if (!isValid || isMediaQuestion) {
            return false;
        }
    }

    return !isMediaCategory;
};

exports.getRandomCategories = (cb) => {
    let categories = [];
    let usedCategoryIds = [];

    const recursiveGetRandomCategory = () => {
        getRandomCategory((error, category) => {
            if (error || usedCategoryIds.includes(category['id'])) {
                recursiveGetRandomCategory();
            } else {
                categories.push(category);
                usedCategoryIds.push(category['id']);

                if (categories.length === NUM_CATEGORIES) {
                    cb(categories);
                } else {
                    recursiveGetRandomCategory();
                }
            }
        });
    };

    recursiveGetRandomCategory();
};
