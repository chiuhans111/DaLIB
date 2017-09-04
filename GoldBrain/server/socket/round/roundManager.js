var socket = require('socket.io');

var db = require('../../data/base');
var io = require('../io');

var model_contest = require('../../data/models/contest');
var crypt = require('crypt');

// TYPE HELPERS
var type_contest = model_contest.type;
var type_contest_team = new model_contest.type().teams[0];

var Round = require('./round');

var rounds = {};

// ENCODER
var secret = 'CoFfEe';
var offset = Math.floor(Math.random() * 255);

// MAIN METHOD, work when socket connected

var incr = 6;
var secret = crypt.SKeygen(Math.floor(Math.random() * 10000), 'DUCK');
console.log(secret);

var work = {
    start: new Promise(done => done())
}

io.then(io => {
    io.of('/round').on('connection', socket => {
        for (var i in rounds) rounds[i].connection(socket);
    })
})

exports.start = function (contest) {
    return io.then(io => {
        return work.start = work.start.then(function () {

            if (rounds[contest._id] != null) rounds[contest._id].stop();
            var viewKey = crypt.SKeygen(Math.floor(Math.random() * 5000) + (incr++ % 5000), secret);
            var round = Round(contest, viewKey, io.of('/round'));
            rounds[contest._id] = round;

            return { round, viewKey };
        })
    })
}


