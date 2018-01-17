var express = require('express');
var mongoose = require('mongoose');

var ObjectID = require("mongodb").ObjectID;
var dog = require('tool/dog');

var model = require('../models/contest.js');

var db = require('../base');
var qrcode = require('tool/qrcode');

var _any = express.Router();
var _member = express.Router();
var _team = express.Router();

exports.any = _any;
exports.member = _member;
exports.team = _team;

db.then(mongoose => {
    var collection = mongoose.model('contest', model.schema);

    // MEMBER
    _member.get('/view', (req, res) => {
        collection.findOne(req.contestID, (err, doc) => {
            console.log(req.contestID)
            res.send(doc)
        })
    })

    _member.post('/update', (req, res) => {
        collection.findByIdAndUpdate(req.contestID, req.body, {
            runValidators: true
        }, function (err, doc) {
            res.send(err);
        })
    })

    _member.get('/qrcode', (req, res) => {
        collection.findOne(req.contestID, { "teams.key": 1, "teams.name": 1, "teams.no": 1 }, function (err, doc) {

            var all = Promise.all(doc.teams.map(team => {
                return qrcode.png(team.key).then(code => {
                    return {
                        no: team.no,
                        name: team.name,
                        qrcode: code,
                        key: team.key
                    };
                })
            }))
            console.log(all);
            all.then(result => {
                console.log('sent', result);
                res.send(result);
            })

        })
    })


    // ANY
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
                    usebutton: false,
                    problems: [
                        {
                            title: "新題目",
                            content: "題目敘述",
                            choice: [],
                            timeout: 0,    // 作答時間
                            score: 3, // 得分
                            answer: {
                                value: '',
                                description: '答案敘述',
                            },
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