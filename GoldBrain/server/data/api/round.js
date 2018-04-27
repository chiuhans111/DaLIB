var express = require('express');
var mongoose = require('mongoose');

var ObjectID = require("mongodb").ObjectID;
var dog = require('tool/dog');

var model = require('../models/contest.js');

var db = require('../base');

var roundManager = require('../../socket/round/roundManager.js');

var _any = express.Router();
var _member = express.Router();
var _team = express.Router();

exports.any = _any;
exports.member = _member;
exports.team = _team;

db.then(mongoose => {
    var collection = mongoose.model('contest', model.schema);
    // MEMBER
    _member.get('/start', (req, res) => {
        collection.findById(req.contestID)
            .exec((err, doc) => {
                roundManager.start(doc).then(info => {
                    res.send(info.viewKey);
                })
            })
    })

    _member.get('/stop', (req, res) => {
        collection.findById(req.contestID)
            .exec((err, doc) => {
                roundManager.stop(doc).then(info => {
                    res.send('stopped');
                })
            })
    })

    // TEAM
    _team.get('/', (req, res) => {

        collection.findById(req.team.contestID)
            .select(model.mask.any)
            .exec((err, doc) => res.send(doc));
    })
})