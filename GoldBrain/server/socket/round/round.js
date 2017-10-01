var socket = require('socket.io');
var type_socket_io = socket();
var type_socket = type_socket_io.sockets.connected[''];

var model_contest = require('../../data/models/contest');
var type_contest = model_contest.type;
var type_contest_team = new model_contest.type().teams[0];

var crypt = require('crypt');

var actions = require('./actions');
var colors = require('colors');
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

        //// LOGIN
        socket.on(actions.login, key => {
            if (socket.login) return;
            // VIEWER Login
            console.log('login');

            if (key == me.viewKey) {
                socket.join(contestID);
                socket.join(contestID_member);
                // up to date
                socket.emit(actions.state, me.state_any());
                socket.emit(actions.round, me.state.round);
                socket.emit(actions.problem, me.state.problem);
                socket.emit(actions.race, me.raceTeams);
                socket.login = true;
                return;
            }


            // MEMBER Login

            if (key == contest.key) {
                socket.join(contestID);
                socket.join(contestID_member);
                socket.member = true;
                // MEMBER COMMUNICATION

                socket.on(actions.round, me.setRound);
                socket.on(actions.problem, me.setProblem);
                socket.on(actions.racestart, me.raceStart);
                socket.on(actions.answer, me.answer);
                // up to date
                socket.emit(actions.state, me.state_any());
                socket.emit(actions.round, me.state.round);
                socket.emit(actions.problem, me.state.problem);
                socket.emit(actions.race, me.raceTeams);
                socket.login = true;
                return;
            }

            // TEAM Login

            var passed = contest.teams.filter(team => key.includes(team.key));
            if (passed.length == 1) {
                var team = passed[0];

                if (me.onlineTeams[team.no]) {
                    socket.emit(actions.showinfo, {
                        content: '你不能同時登入兩台或以上裝置，請先關閉其他裝置',
                        backgroundColor: colors.error
                    })
                    return;
                }

                if (team.round < me.state.round) return;
                socket.team = team;

                socket.join(contestID);
                socket.on(actions.race, answer => me.race(team.no, answer));
                me.onlineTeams[team.no] = socket;                 // online
                console.log('a team has joined us!!');

                // TEAM COMMUNICATION!
                socket.login = true;
                var state = me.state_any();

                socket.in(contestID).broadcast.emit(actions.state, state);
                // up to date

                state.team = team.no;
                socket.emit(actions.state, state);
                if (me.state.page == '') return;
                socket.emit(actions.round, me.state.round);
                if (me.state.page == 'round') return;
                socket.emit(actions.problem, me.state.problem);
                if (me.state.page == 'problem') return;
                socket.emit(actions.race, me.raceTeams);
                if (me.state.page == 'race') return;
                socket.emit(actions.info, me.raceTeams);

            }

        })


        socket.on('disconnect', () => {
            if (socket.team) {
                me.onlineTeams[socket.team.no] = false;          // offline
                console.log('a team has lost connection.. QQ');
                room.emit(actions.state, me.state_any());
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
        var round_info = contest.rounds[round];
        var obj = {
            no: round,
            title: round_info.name,
            usebutton: round_info.usebutton
        }
        me.state.page = 'round';
        me.state.round = obj;
        room.emit(actions.round, obj);
    }

    this.setProblem = function (problem) {
        var problem_info = contest.rounds[me.state.round.no].problems[problem];
        var obj = {
            no: problem,
            title: problem_info.title,
            choise: problem_info.choise,
            score: problem_info.score
        }
        me.state.page = 'problem';
        me.state.problem = obj;
        room.emit(actions.problem, obj);
    }


    /**@type {Array.<type_socket>} */
    this.onlineTeams = {};
    /**@type {Array.<type_racer>} */
    this.raceTeams = [];

    this.state = {
        page: '',
        round: {
            no: 0,
            title: '',
            usebutton: false
        },
        problem: {
            no: 0,
            title: '',
            choise: [],
            score: 0,
        },
        info: {
            content: '',
            backgroundColor: ''
        }
    }

    this.state_any = function () {
        var obj = {}
        obj.teams = contest.teams.map(team => ({
            name: team.name,
            no: team.no,
            score: team.score,
            online: me.onlineTeams[team.no] ? true : false
        }))
        return obj;
    }

    this.state_member = function () {
        var obj = me.state_any();
        obj.raceTeams = me.raceTeams;
        return obj;
    }

    //// RACE
    this.raceStart = function () {
        me.raceTeams = [];
        me.state.page = 'race';
        room.emit(actions.racestart)
    }
    this.race = function (no, answer) {
        me.raceTeams.push({
            no, answer, time: new Date().getTime()
        })
        io.in(contestID_member).emit(actions.race, me.raceTeams);
    }


    // OTHER IMPORTANT THINGS
    this.showinfo = function (text, bgcolor = 'white') {
        me.state.info.content = text;
        me.state.info.backgroundColor = bgcolor;
        me.state.page = 'info';
        room.emit(actions.showinfo, me.state.info);
    }

    /**@param {Array.<{correct: Boolean, team: String, message: String, score:Number, hidden:Boolean}>} data*/
    this.answer = function (data) {
        data.filter(reply => reply.correct).map(reply => {
            me.contest.teams[index].score += reply.score;
        })
        me.contest.save();
        for (var i in me.onlineTeams) {
            var team = me.onlineTeams[i];
            var info = data.filter(reply => reply.team == i && !reply.hidden)[0];
            if (info) team.emit(actions.showinfo, {
                content: `${info.correct ? reply.score + '分\n恭喜答對' : '答錯了'}\n${info.message}`,
                backgroundColor: info.correct ? colors.ok : colors.error
            })
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