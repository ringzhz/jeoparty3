const js = require('jservice-node');

const formatRaw = require('./format').formatRaw;
const formatCategory = require('./format').formatCategory;

const MAX_CATEGORY_ID = 18418;
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

const getRandomCategory = (cb) => {
    const categoryId = Math.floor(Math.random() * MAX_CATEGORY_ID) + 1;

    js.category(categoryId, (error, response, category) => {
        if (!error && response.statusCode === 200) {
            const cluesCount = category.clues_count;
            const startingIndex = Math.round((Math.random() * (cluesCount - 5)) / 5) * 5;
            category.clues = category.clues.slice(startingIndex, startingIndex + 5);

            if (approveCategory(category)) {
                cb(error, formatCategory(category));
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
    const rawCategoryTitle = formatRaw(category.title);
    const isMediaCategory = rawCategoryTitle.includes('logo') || rawCategoryTitle.includes('video');

    for (let i = 0; i < NUM_CLUES; i++) {
        const clue = category.clues[i];
        const rawQuestion = formatRaw(clue.question);

        const isValid = rawQuestion.length > 0 && clue.invalid_count === null;
        const isMediaQuestion =
            rawQuestion.includes('seenhere') ||
            rawQuestion.includes('heardhere') ||
            rawQuestion.includes('video');

        if (!isValid || isMediaQuestion) {
            return false;
        }

        category.clues[i].completed = false;
    }

    category.completed = false;
    category.numCluesUsed = 0;

    return !isMediaCategory;
};

exports.getRandomCategories = (cb) => {
    let categories = [];
    let doubleJeopartyCategories = [];
    let usedCategoryIds = [];

    const recursiveGetRandomCategory = () => {
        getRandomCategory((error, category) => {
            if (error || usedCategoryIds.includes(category.id)) {
                recursiveGetRandomCategory();
            } else {
                if (categories.length < NUM_CATEGORIES) {
                    categories.push(category);
                } else {
                    doubleJeopartyCategories.push(category);
                }

                usedCategoryIds.push(category.id);

                if (doubleJeopartyCategories.length === NUM_CATEGORIES) {
                    cb(categories, doubleJeopartyCategories);
                } else {
                    recursiveGetRandomCategory();
                }
            }
        });
    };

    recursiveGetRandomCategory();
};
