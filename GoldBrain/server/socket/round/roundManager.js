var db = require('../../data/base');
var io = require('../io');

var model_contest = require('../../data/models/contest');
var crypt = require('tool/crypt');

// TYPE HELPERS
var type_contest = model_contest.type;
var type_contest_team = new model_contest.type().teams[0];

var socket = require('socket.io');
var type_socket_io = socket();
var type_socket = type_socket_io.sockets.connected[''];

var Round = require('./round');
var actions = require('./actions');

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

var waiting = [];


io.then(io => {
    io.of('/round').on('connection', socket => {

        socket.on(actions.login, key => {

            for (var i in rounds) {
                if (rounds[i].login(socket, key)) return;
            }

            if (!socket.login) {
                socket.emit(actions.close, 'not opened');

                socket.emit(actions.showinfo, {
                    content: "你的比賽還沒開始，請耐心等候~~",
                    backgroundColor: "white"
                })
            }

            // put in wait
            socket.key = key;
            waiting.push(socket);
            socket.on("disconnect", () => {
                socket.key = null;
                waiting = waiting.filter(s => s != socket);
            });



        })
    })
})

exports.start = function (contest) {
    return io.then(io => {
        return work.start = work.start.then(function () {
            if (contest == null) return { round: '?', viewKey: '?' };

            if (rounds[contest._id] != null) rounds[contest._id].stop();
            var viewKey = crypt.SKeygen(Math.floor(Math.random() * 5000) + (incr++ % 5000), secret);
            var round = Round(contest, viewKey, io.of('/round'));
            rounds[contest._id] = round;

            waiting = waiting.filter(socket => {
                // return false for removing socket from waiting line
                if (round.login(socket, socket.key)) return false;
                return true;
            })

            return { round, viewKey };
        })
    })
}


exports.stop = function (contest) {
    return work.start = work.start.then(function () {

        if (contest == null) {
            console.log('contest not define');
            return;
        }
        if (rounds[contest._id] != null) rounds[contest._id].stop();
    })
}

