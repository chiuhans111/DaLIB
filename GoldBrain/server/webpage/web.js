var express = require("express"),
    bodyparser = require("body-parser"),
    morgan = require('morgan'),
    http = require('http');

var dog = require("tool/dog");

var app = express();

app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ type: 'application/*' }));

dog.watch(app);
var config = require('../data/config')
var server = http.createServer(app);
server.listen(config.port);
app.server = server;

app.use(function (error, req, res, next) {
    if (error) res.send({ error: error.message });
    else next();
});


module.exports = app;