var express = require('express');
var ObjectID = require("mongodb").ObjectID;

var db = require('../data/base');
var contest = require('../data/api/contest');
var app = express.Router();
module.exports = app;



db.then(mongoose => {
    var memberApp = express.Router();
    app.use(memberApp);

    memberApp.use((req, res, next) => {
        mongoose.db.collection('contests').find().toArray().then(contests => {
            var result = req.dogwho(contests)[0];
            if (result == undefined) res.send('什麼都沒找到');
            else {
                req.contestId = result._id;
                next();
            }
        })
    })

    memberApp.use('/contest', contest.member)
})
