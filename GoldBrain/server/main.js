var express = require('express');

var app = require("./webpage/web.js");
var db = require("./data/base.js");
var io = require("./socket/io.js");

var api = require('./routes/api.js');

var roundManager = require('./socket/round/roundManager');

// DATABASE
db.then(db => {

    app.use('/api', api.connect(db));
    console.log('db connected, api is avaliable');

})

io.then(io => {
    io.on('connection', socket => {
        socket.on('hi', data => {
            console.log('you ping me')
            socket.emit('pong', {
                data, time: new Date().getTime()
            })
        })
    });

    console.log('io connected, socket is avaliable');
})

exports.publicFolder = function (path) {
    app.use(
        express.static(path, {
            extensions: ['html', 'htm']
        })
    );
}