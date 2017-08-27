var express = require('express');

var app = require("./webpage/web.js");
var db = require("./data/base.js");

var api = require('./routes/api.js');

// DATABASE
db.then(db => {

    app.use('/api', api.connect(db));
    console.log('db connected, api is avaliable');

})

// SOCKET IO
var socket = require('socket.io');

var io = socket(app.server, null);
io.on('connection', function (socket) {

    socket.on('join', function (data) {
        socket.join(data);
        io.to('1234').emit('message', 'hi you joinned!');

    })

    socket.on('disconnect', function () {

    })
})



exports.publicFolder = function (path) {
    app.use(
        express.static(path, {
            extensions: ['html', 'htm']
        })
    );
}