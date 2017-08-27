var express = require('express');
var ObjectID = require("mongodb").ObjectID;
var db = require('../data/base');

var contest = require('../data/api/contest');

var app = express.Router();
module.exports = app;

var cache = {};

function find(req, contests) {

    var map = [];

    contests.map(contest => {
        contest.teams.map((team, index) => {
            var key = team.key;
            map.push({
                key, index, contestID: contest._id
            })
        });
    })

    return req.dogwho(map)[0];
}


db.then(mongoose => {
    var memberApp = express.Router();
    app.use(memberApp);

    memberApp.use((req, res, next) => {
        mongoose.db.collection('contests').find().toArray().then(contests => {
            var result = find(req, contests);
            console.log('1', result);
            if (result == undefined) res.send('什麼都沒找到');
            else {
                req.team = result;
                next();
            }
        })
    })

    memberApp.use('/contest', contest.team)
})
