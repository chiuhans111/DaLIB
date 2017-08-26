var express = require('express');

var app = require("./webpage/web.js");
var db = require("./data/base.js");

var api = require('./routes/api.js');

db.then(db => {


    app.use('/api', api.connect(db));
    console.log('db connected, api is avaliable');

})

exports.publicFolder = function (path) {
    app.use(
        express.static(path, {
            extensions: ['html', 'htm']
        })
    );
}