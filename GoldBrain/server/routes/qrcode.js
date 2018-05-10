var express = require('express');
var app = express.Router();
var qrcode = require('../data/qrcode');
module.exports = app;

app.get('/:code', (req, res) => {
    qrcode.png(req.params.code).then(value => {
        res.send(value)
    })
});

app.post('/', (req, res) => {
    qrcode.png(req.body.data).then(value => {
        res.send(value)
    })
});