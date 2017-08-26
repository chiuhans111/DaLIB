var express = require('express');
var mongoose = require('mongoose');

var ObjectID = require("mongodb").ObjectID;
var dog = require('tool/dog');

var model = require('../models/contest.js');


var db = require('../base');


var _any = express.Router();
var _member = express.Router();
var _view = express.Router();

exports.any = _any;
exports.member = _member;
exports.view = _view;

db.then(mongoose => {
    var collection = mongoose.model('contest', model.schema);

    _member.get('/view', (req, res) => {
        collection.find(req.contestId, (err, doc) => {
            console.log('viewing', req.contestId);
            res.send(doc)
        })
    })

    _member.post('/update', (req, res) => {
        collection.findByIdAndUpdate(req.contestId, req.body, {
            runValidators: true
        }, function (err, doc) {
            res.send(err);
        })
    })

    

    _any.get('/create/:count', (req, res) => {
        var key = dog.keygen(20);
        var count = +req.params.count;

        var teams = Array(count).fill().map((x, i) => ({
            no: i,
            name: "第" + (i + 1) + "隊",
            key: dog.keygen(2),
            score: 0,
            round: 0
        }));

        var item = new collection({
            key,
            teams,
            name: "新比賽",
            rounds: [
                {
                    players: count,    // 多少人可以參加這一輪
                    name: "第一輪",
                    problems: [
                        {
                            title: "新題目",
                            content: "題目敘述",
                            choise: [],
                            timeout: 0,    // 作答時間
                            score: 3 // 得分
                        }
                    ],
                }
            ]
        })
        if (item.validateSync()) console.log("error?");
        item.save(function (err) {
            console.log(err)
            res.send(key);
        });
        /*
        collections.insertOne(item).then(r => {
            res.send(key);
        })*/
    })
})