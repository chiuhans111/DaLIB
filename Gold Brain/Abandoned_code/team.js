var express = require('express');
var ObjectID = require("mongodb").ObjectID;

var db = require('../base');
exports.any = express.Router();
exports.master = express.Router();
exports.member = express.Router();


db.then(db => {
    var team = db.collection('team');

    // any body
    exports.any.get('/', (req, res) => {
        team.find()
            .project({ name: 1, _id: 0 })
            .toArray()
            .then(doc => res.send(doc));
    })

    exports.any.post('/checkname', (req, res) => {
        var name = req.body.name;
        team.find({ name }).count().then(count => {
            if (count == 0) res.send(false);
            else res.send(true)
        })
    })

    exports.any.post('/create', (req, res) => {
        var key = req.dog.keygen(20);
        var name = req.body.name;
        team.find({ name }).count().then(count => {
            if (count == 0) team.insertOne({

                name,       // team name
                key,        // team key, use this to login
                medal: [],  // team medal
                time: new Date().toLocaleDateString(),

            }).then(r => res.send(r));
            else res.send({ error: '名稱已經被取用' })
        })
    })

    // game master
    exports.master.get('/', (req, res) => {
        team.find()
            .project({ name: 1, key: 0 })
            .toArray()
            .then(doc => res.send(doc));
    })

    exports.master.post('/medal/:rank/:id', (req, res) => {

        team.updateOne({
            _id: ObjectID(req.params.id)
        }, {
                $push: {
                    medal: {
                        id: req.masterId,
                        rank: req.params.rank
                    }
                }
            }
        ).then(r => res.send(r))
    })

    exports.master.get('/remove/medal/:id', (req, res) => {
        team.findOne({
            _id: ObjectID(req.params.id)
        }).then(doc => {
            var medal = doc.medal;
            medal = medal.filter(x => x.id != req.masterId);
            team.updateOne({
                _id: ObjectID(req.params.id)
            }, {
                    $set: { medal }
                }
            ).then(r => res.send(r))
        })
    })

    // member

    exports.member.get('/', (req, res) => {
        team.findOne({
            _id: ObjectID(req.memberId)
        }).then(doc => {
            delete doc._id;
            res.send(doc)
        });
    })

    exports.member.post('/update/', (req, res) => {
        var $set = {};

        if (req.body.name) $set.name = req.body.name;

        team.updateOne({
            _id: req.memberId
        }, { $set }).then(r => res.send(r));
    })
})
