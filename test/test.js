const assert = require('assert');

const checkAnswer = require('../src/helpers/check').checkAnswer;

describe('checkAnswer', () => {
    describe('answer containment', () => {
        it('should return true when the answers are the same', () => {
            assert.strictEqual(checkAnswer('', '', 'Washington', 'Washington'), true);
        });

        it('should return true when actual is contained in expected', () => {
            assert.strictEqual(checkAnswer('', '', 'Washington', 'Wash'), true);
        });

        it('should return false when actual is contained in expected but is too short', () => {
            assert.strictEqual(checkAnswer('', '', 'Washington', 'Wa'), false);
        });

        it('should return true when expected is contained in actual', () => {
            assert.strictEqual(checkAnswer('', '', 'Wash', 'Washington'), true);
        });

        it('should return true when expected is contained in actual and is too short', () => {
            assert.strictEqual(checkAnswer('', '', 'Wa', 'Washington'), true);
        });

        it('should return true when the answers are the same but are too short', () => {
            assert.strictEqual(checkAnswer('', '', 'Wa', 'Wa'), true);
        });

        it('should return false when the answers are different by one letter', () => {
            assert.strictEqual(checkAnswer('', '', 'Washington', 'Washingston'), false);
        });
    });

    describe('number component answers', () => {
        it('should return true when number answers are the same', () => {
            assert.strictEqual(checkAnswer('', '', '16 Candles', '16 Candles'), true);
        });

        it('should return true when word answers are the same', () => {
            assert.strictEqual(checkAnswer('', '', 'Sixteen Candles', 'Sixteen Candles'), true);
        });

        it('should return true when actual has number and expected has word', () => {
            assert.strictEqual(checkAnswer('', '', 'Sixteen Candles', '16 Candles'), true);
        });

        it('should return true when actual has word and expected has number', () => {
            assert.strictEqual(checkAnswer('', '', '16 Candles', 'Sixteen Candles'), true);
        });

        it('should return true when actual is too short but both have a number', () => {
            assert.strictEqual(checkAnswer('', '', '20th century', '20'), true);
        });

        it('should return true when actual has word and expected has number component', () => {
            assert.strictEqual(checkAnswer('', '', '20th century', 'Twenty'), true);
        });
    });

    describe('only number answers', () => {
        it('should return true when both are numbers', () => {
            assert.strictEqual(checkAnswer('', '', '20', '20'), true);
        });

        it('should return true when both are words', () => {
            assert.strictEqual(checkAnswer('', '', 'twenty', 'twenty'), true);
        });

        it('should return true when actual is number and expected is word', () => {
            assert.strictEqual(checkAnswer('', '', 'twenty', '20'), true);
        });

        it('should return true when actual is word and expected is number', () => {
            assert.strictEqual(checkAnswer('', '', '20', 'twenty'), true);
        });
    });

    describe('acronyms', () => {
        it('should return true when expected is long and actual is initial', () => {
            assert.strictEqual(checkAnswer('', '', 'martinlutherkingjr', 'mlk'), true);
        });

        it('should return true when expected is initial and actual is long', () => {
            assert.strictEqual(checkAnswer('', '', 'jfk', 'kennedy'), true);
        });
    });

    describe('cheated', () => {
        it('should return false when actual appeared in category name', () => {
            assert.strictEqual(checkAnswer('famous johns', '', 'john malkovich', 'john'), false);
        });

        it('should return false when actual appeared in clue', () => {
            assert.strictEqual(checkAnswer('', 'this guy named john', 'john malkovich', 'john'), false);
        });

        it('should return true when actual and expected both appear in the category name', () => {
            assert.strictEqual(checkAnswer('mexico, canada, or the usa', 'which country is north', 'canada', 'canada'), true);
        });
    });

    describe('debug', () => {
        it('should return true', () => {
            assert.strictEqual(checkAnswer('WORLD CAPITALS', 'Among Communist countries, the 2 national capitals that begin with \"H\"', ' Hanoi (Vietnam) & Havana (Cuba)', 'havana'), true);
        });
    });
});
