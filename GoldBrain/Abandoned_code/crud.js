var ObjectID = require("mongodb").ObjectID;

function delbytargets(collection) {
    return function (targets) {
        return new Promise(done => {
            collection.deleteMany({
                $or: targets.map(target => ({ _id: ObjectID(target) }))
            }).then(done, console.log);
        })
    }
}
function getbyfilter(collection) {
    return function (filter) {
        return new Promise(done => {
            collection.find(filter ? filter : {}).toArray()
                .then(done, console.log);
        })
    }
}
function getbytargets(collection) {
    return function (targets) {
        return new Promise(done => {
            collection.find({
                $or: targets.map(target => ({ _id: ObjectID(target) }))
            }).toArray().then(done, console.log);
        })
    }
}
function setbytargetobj(collection) {
    return function (target, obj) {
        var obj2 = JSON.parse(JSON.stringify(obj));
        delete obj2._id;
        return new Promise(done => {
            collection.updateOne({ _id: ObjectID(target) }, {
                $set: obj2
            }).then(done, console.log);
        })
    }
}

module.exports = function (db, dog) {
    if (!db) {
        console.log('OPEN THE DB !!!!!!!!!!!!!!');
        return 0;
    }
    var col = {
        teams: db.collection('team'),
        problems: db.collection('problem')
    }
    return {
        team: {
            add: function (amount) {
                return new Promise(done => {
                    col.teams.insertMany([...Array(amount)].map(x => ({
                        name: "team", key: dog.keygen(10)
                    }))).then(done, console.log);
                })
            },
            del: delbytargets(col.teams),
            get: getbyfilter(col.teams),
            getbyid: getbytargets(col.teams),
            set: setbytargetobj(col.teams)
        },
        problem: {
            add: function (amount) {
                return new Promise(done => {
                    col.problems.insertMany([...Array(amount)].map(x => ({
                        title: "題目標題",
                        score: "3",
                        timeout: 0,
                        desc: "題目敘述",
                        choice: [],
                        answer: "答案",
                        answer_desc: "答案敘述",
                        result: []
                    }))).then(done, console.log);
                })
            },
            del: delbytargets(col.problems),
            get: getbyfilter(col.problems),
            getbyid: getbytargets(col.problems),
            set: setbytargetobj(col.problems)
        }
    }
}