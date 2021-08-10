const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://admin:lEs45HnBK0EUwy2h@jeoparty.xssla.mongodb.net/leaderboard?retryWrites=true&w=majority';
const client = new MongoClient(url);
const connection = client.connect();

const resetLeaderboard = async (colName) => {
    try {
        await connection;

        const db = client.db('leaderboard');
        await db.collection(colName).drop();

        const leaderboardCol = db.collection(colName);
        const sampleLeaderboardCol = db.collection('sample');

        const leaderboard = await sampleLeaderboardCol.find({}).toArray();
        for (const leader of leaderboard) {
            await leaderboardCol.insertOne(leader);
        }
    } catch (err) {
        console.log(err.stack);
    }
}

exports.getLeaderboard = async () => {
    try {
        await connection;

        const db = client.db('leaderboard');
        const leaderboardCol = db.collection('allTime');

        return await leaderboardCol.find({}).toArray();
    } catch (err) {
        console.log(err.stack);
    }
}

exports.updateLeaderboard = async (player) => {
    try {
        await connection;

        const db = client.db('leaderboard');

        for (const colName of ['allTime']) {
            const leaderboardCol = db.collection(colName);
            const leaderboard = await leaderboardCol.find({}).toArray();

            let i = 0;

            const checkNewLeader = () => {
                const leader = leaderboard[i];

                if (player.score > leader.score) {
                    let j = i + 1;

                    const pushLeaders = () => {
                        leaderboardCol.findOneAndUpdate({ 'position': j }, {
                            '$set': {
                                'name': leaderboard[j - 1].name,
                                'score': leaderboard[j - 1].score
                            }
                        }).then(() => {
                            j++;

                            if (j <= 9) {
                                pushLeaders();
                            } else {
                                leaderboardCol.findOneAndUpdate({ 'position': i }, {
                                    '$set': {
                                        'name': player.name, 'score': player.score
                                    }
                                });
                            }
                        });
                    };

                    pushLeaders();
                } else {
                    i++;

                    if (i < 10) {
                        checkNewLeader();
                    }
                }
            };

            checkNewLeader();
        }
    } catch (err) {
        console.log(err.stack);
    }
}