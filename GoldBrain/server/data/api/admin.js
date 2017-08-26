var express = require('express');
var ObjectID = require("mongodb").ObjectID;

var db = require('../base');
var app = express.Router();
module.exports = app;

db.then(mongoose => {

    var db = mongoose.db;
    app.get('/collections', (req, res) => {
        db.listCollections()
            .toArray()
            .then(collections => res.send(collections))
    })

    app.get('/drop/:collection', (req, res) => {
        db.collection(req.params.collection)
            .drop((err, reply) => res.send(reply));
    })

    app.get('/collection/:collection', (req, res) => {
        db.collection(req.params.collection)
            .find()
            .toArray()
            .then(doc => res.send(doc));
    })

    app.get('/find/:collection/:id', (req, res) => {
        db.collection(req.params.collection)
            .findOne({ _id: ObjectID(req.params.id) })
            .then(doc => res.send(doc));
    })
/*
    app.post('/find/:collection', (req, res) => {
        db.collection(req.params.collection)
            .find()
            .insertOne(req.body)
            .then(r => res.send(r));
    })
*/
    app.post('/create/:collection', (req, res) => {
        db.collection(req.params.collection)
            .insertOne(req.body)
            .then(r => res.send(r));
    })

    app.post('/update/:collection/:id', (req, res) => {
        db.collection(req.params.collection)
            .updateOne({ _id: ObjectID(req.params.id) }, req.body)
            .then(r => res.send(r));
    })

    app.get('/delete/:collection/:id', (req, res) => {
        db.collection(req.params.collection)
            .deleteOne({
                _id: ObjectID(req.params.id)
            }).then(r => res.send(r))
    })

    app.post('/delete/:collection', (req, res) => {
        db.collection(req.params.collection)
            .deleteMany({
                $or: req.body.ids.map(id => ({ _id: ObjectID(id) }))
            }).then(r => res.send(r))
    })

})