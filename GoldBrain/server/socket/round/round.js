var socket = require('socket.io');
var type_socket_io = socket();
var type_socket = type_socket_io.sockets.connected[''];

var model_contest = require('../../data/models/contest');
var type_contest = model_contest.type;
var type_contest_team = new model_contest.type().teams[0];

var crypt = require('crypt');

var actions = require('./actions');

/**
 * @typedef {Object} type_racer
 * @property {Number} no
 * @property {String} answer
 * @property {Number} time
 */

/**
 * instance of a Round, using a contet
 * @param {type_contest} contest 
 * @param {type_socket_io} io
 */
function Round(contest, viewKey, io) {
    console.log('starting new round');
    var contestID = contest._id;
    var contestID_member = 'memberonly_' + contest._id;
    //console.log(contestID, contestID_member);
    var room = io.in(contestID);
    var room_member = io.in(contestID_member);

    this.viewKey = viewKey;

    /**@type {Array.<type_socket>} */
    var sockets = [];

    // FIRST SETUP IO!
    var event_connection;
    /**@param {type_socket} socket */
    this.connection = function (socket) {
        socket.emit('actions', actions);

        sockets.push(socket);
        console.log('got connection');
        socket.on(actions.login, key => {
            if (socket.login) return;
            // VIEWER Login
            console.log('login');

            if (key == me.viewKey) {
                socket.join(contestID);
                socket.join(contestID_member);
                socket.emit(actions.state, me.state_any());
                socket.login = true;
                return;
            }


            // MEMBER Login

            if (key == contest.key) {
                socket.join(contestID);
                socket.join(contestID_member);
                socket.member = true;
                // MEMBER COMMUNICATION

                socket.on(actions.setRound, me.setRound);
                socket.on(actions.setProblem, me.setProblem);
                socket.on(actions.showProblem, me.showProblem);
                socket.on(actions.raceStart, me.startRace);
                socket.emit(actions.state, me.state_member());
                socket.login = true;
                return;
            }

            // TEAM Login

            var passed = contest.teams.filter(team => key.includes(team.key));
            if (passed.length == 1) {
                var team = passed[0];
                if (team.round < me.state.round) return;
                socket.team = team;

                socket.join(contestID);
                socket.on(actions.race, answer => me.race(team.no, answer));
                me.onlineTeams[team.no] = true;                 // online
                console.log('a team has joined us!!');

                // TEAM COMMUNICATION!
                room.emit(actions.state, me.state_any());
                socket.login = true;
            }

        })

        socket.on('disconnect', () => {
            if (socket.team) {
                delete me.onlineTeams[socket.team.no];          // offline
                console.log('a team has lost connection.. QQ');
                socket.emit(actions.state, me.state_member());
            }
        })

    }


    /**@type {Round} */
    var me = this;

    /**@type {type_contest} */
    this.contest = contest;

    this.setRound = function (round) {
        me.state.round = round;
        me.state.problem.no = 0;
        me.state.problem.info = null;
        room.emit(actions.setRound, me.state.round);
    }

    this.setProblem = function (problem) {
        me.state.problem.no = problem;
        me.state.problem.info = null;
        room.emit(actions.setProblem, me.state.problem.no);
    }



    this.onlineTeams = {};
    /**@type {Array.<type_racer>} */
    this.raceTeams = [];

    this.state = {
        round: 0,
        problem: {
            no: 0,
            info: null
        }
    }


    this.state_any = function () {
        var obj = me.state;
        obj.teams = contest.teams.map(team => ({
            name: team.name,
            no: team.no,
            score: team.score,
            online: me.onlineTeams[team.no] || false
        }))
        return obj;
    }

    this.state_member = function () {
        var obj = me.state_any();
        obj.raceTeams = me.raceTeams;
        return obj;
    }

    // RACE
    this.startRace = function () {
        me.raceTeams = [];
        room.emit(actions.raceStart)
    }
    this.race = function (no, answer) {
        me.raceTeams.push({
            no, answer, time: new Date().getTime()
        })
        io.in(contestID_member).emit(actions.race, me.raceTeams);
    }


    // OTHER IMPORTANT THINGS

    this.showProblem = function () {
        try {

            var problem = contest.rounds[me.state.round].problems[me.state.problem.no];
            var choice = problem.choice;
            var title = problem.title;
            var state = me.state_any();

            var info = {
                title,
                choice
            };

            state.problem.info = info;
            room.emit(actions.showProblem, info);
        } catch (e) {
            console.error(e);
        }
    }



    this.stop = function () {
        console.log('round', viewKey, 'stopped')
        room.emit(actions.close);
        sockets.map(socket => socket.disconnect(true));
    }
}

/**
 * instance of a Round, using a contet
 * @param {type_contest} contest 
 * @param {type_socket_io} io
 * @return {Round}
 */
module.exports = function (contest, io) {
    return new Round(...arguments);
}