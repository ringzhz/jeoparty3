const _ = require("lodash");

const formatRaw = require("./format").formatRaw;
const formatCategory = require("./format").formatCategory;

const finalJeopartyClues = require("../constants/finalJeopartyClues.js").finalJeopartyClues;
const axios = require("axios");
const MAX_CATEGORY_ID = 18418;
const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;

const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const weightedRandomClueIndex = () => {
  let sum = 0;
  let r = Math.random();

  const distribution = { 0: 0.05, 1: 0.2, 2: 0.4, 3: 0.2, 4: 0.15 };

  for (const i in distribution) {
    sum += distribution[i];

    if (r <= sum) {
      return parseInt(i);
    }
  }
};

const getDailyDoubleIndices = () => {
  const categoryIndex = Math.floor(Math.random() * NUM_CATEGORIES);
  const clueIndex = weightedRandomClueIndex();

  const djCategoryIndex1 = Math.floor(Math.random() * NUM_CATEGORIES);
  const djClueIndex1 = weightedRandomClueIndex();

  let djCategoryIndex2;
  do {
    djCategoryIndex2 = Math.floor(Math.random() * NUM_CATEGORIES);
  } while (djCategoryIndex1 === djCategoryIndex2);
  const djClueIndex2 = weightedRandomClueIndex();

  return [categoryIndex, clueIndex, djCategoryIndex1, djClueIndex1, djCategoryIndex2, djClueIndex2];
};

const getRandomCategory = async (cb) => {
  const category = await (async function () {
    for (let retriesRemaining = 10; retriesRemaining > 0; retriesRemaining--) {
      const categoryId = Math.floor(Math.random() * MAX_CATEGORY_ID) + 1;

      try {
        // const res = await axios.get(`http://jeoparty.local:3000/api/category?id=${categoryId}`); // FIXME no commit
        const res = await axios.get(`http://j-service:3000/api/category?id=${categoryId}`);
        return res.data;
      } catch (error) {
        console.log(`failed to load category ${categoryId}. ${retriesRemaining} retries remaining`);
        console.log(`http://j-service:3000/api/category?${categoryId}`);
      }
    }
  })();
  if (!category) {
    throw new Error("Poor luck, old chap!");
  }
  const cluesCount = category.clues_count;
  const startingIndex = Math.round((Math.random() * (cluesCount - 5)) / 5) * 5;
  category.clues = category.clues.slice(startingIndex, startingIndex + 5);

  if (approveCategory(category)) {
    // cb(error, formatCategory(category));
    cb(null, formatCategory(category));
  } else {
    cb(true, category);
  }
};

const approveCategory = (category) => {
  const rawCategoryTitle = formatRaw(category.title);
  const isMediaCategory = rawCategoryTitle.includes("logo") || rawCategoryTitle.includes("video");

  for (let i = 0; i < NUM_CLUES; i++) {
    const clue = category.clues[i];
    if (!clue.question) {
      console.log("what the hey", clue);
    }
    const rawQuestion = formatRaw(clue.question);

    const isValid = rawQuestion.length > 0 && clue.invalid_count === null;
    const isMediaQuestion =
      rawQuestion.includes("seenhere") ||
      rawQuestion.includes("picturedhere") ||
      rawQuestion.includes("heardhere") ||
      rawQuestion.includes("video");

    if (!isValid || isMediaQuestion) {
      return false;
    }

    clue.completed = false;
    clue.dailyDouble = false;
  }

  category.completed = false;
  category.numCluesUsed = 0;

  return !isMediaCategory;
};

exports.getRandomCategories = (cb) => {
  let categories = [];
  let doubleJeopartyCategories = [];
  let finalJeopartyClue = {};
  let usedCategoryIds = [];

  const recursiveGetRandomCategory = () => {
    getRandomCategory((error, category) => {
      if (error || !category || usedCategoryIds.includes(category.id)) {
        console.log(`failed to load category retrying.`);
        recursiveGetRandomCategory();
      } else {
        if (categories.length < NUM_CATEGORIES) {
          categories.push(category);
        } else if (doubleJeopartyCategories.length < NUM_CATEGORIES) {
          doubleJeopartyCategories.push(category);
        } else {
          finalJeopartyClue = choice(finalJeopartyClues);
          finalJeopartyClue.categoryName = finalJeopartyClue.category;
        }

        usedCategoryIds.push(category.id);

        if (_.get(finalJeopartyClue, "categoryName")) {
          const [categoryIndex, clueIndex, djCategoryIndex1, djClueIndex1, djCategoryIndex2, djClueIndex2] = getDailyDoubleIndices();
          categories[categoryIndex].clues[clueIndex].dailyDouble = true;
          doubleJeopartyCategories[djCategoryIndex1].clues[djClueIndex1].dailyDouble = true;
          doubleJeopartyCategories[djCategoryIndex2].clues[djClueIndex2].dailyDouble = true;

          // DEBUG
          // const categoryName = categories[categoryIndex].title;
          // const dollarValue = 200 * (clueIndex + 1);
          // console.log(`Daily double is '${categoryName} for $${dollarValue}'`);

          cb(categories, doubleJeopartyCategories, finalJeopartyClue);
        } else {
          recursiveGetRandomCategory();
        }
      }
    });
  };

  recursiveGetRandomCategory();
};
