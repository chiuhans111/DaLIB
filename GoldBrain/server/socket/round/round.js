var socket = require('socket.io');
var type_socket_io = socket();
var type_socket = type_socket_io.sockets.connected[''];

var model_contest = require('../../data/models/contest');
var type_contest = model_contest.type;
var type_contest_team = new model_contest.type().teams[0];

var crypt = require('tool/crypt');

var actions = require('./actions');
var colors = require('tool/colors');
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
                socket.emit(actions.racestart, me.state.race);
                socket.login = true;
                sockets.push(socket);
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
                socket.on(actions.startrace, me.startRace);
                socket.on(actions.answer, me.answer);
                socket.on(actions.update, me.update)
                // up to date
                socket.emit(actions.state, me.state_any());
                socket.emit(actions.round, me.state.round);
                socket.emit(actions.problem, me.state.problem);
                socket.emit(actions.race, me.raceTeams);
                socket.emit(actions.racestart, me.state.race);

                socket.login = true;
                sockets.push(socket);
                return;
            }


            function sendState(sockets, state) {

                for (var i in sockets) {
                    var socket = sockets[i];


                    if (socket.team) {
                        
                        if (socket.team.round < state.round) {
                            socket.emit(actions.showinfo, {
                                content: '你不屬於這一輪',
                                backgroundColor: colors.error
                            });
                            continue;
                        }

                        state.team = socket.team.no;
                    }
                    else state.team = -1;
                    socket.emit(actions.state, state);
                }
            }

            // TEAM Login

            var passed = contest.teams.filter(team => key.includes(team.key));
            if (passed.length == 1) {
                var team = passed[0];

                if (me.onlineTeams[team.no]) {
                    socket.emit(actions.showinfo, {
                        content: '請嘗試5秒後重新登入，並確保無其他登入中的裝置，',
                        backgroundColor: colors.error
                    });
                    socket.disconnect()
                    return;
                }

                /*
                if (team.round < me.state.round) {
                    socket.emit(actions.showinfo, {
                        content: '你不屬於這一輪',
                        backgroundColor: colors.error
                    });
                    return;
                }*/

                socket.team = team;

                socket.join(contestID);
                socket.on(actions.race, answer => me.race(team.no, answer));
                me.onlineTeams[team.no] = socket;                 // online
                console.log('a team has joined us!!');

                // TEAM COMMUNICATION!
                socket.login = true;
                sockets.push(socket);
                var state = me.state_any();
                sendState(io.in(contestID).connected, state)
                // up to date

                socket.emit(actions.race, me.raceTeams);

                if (me.state.page == '') return;
                socket.emit(actions.round, me.state.round);
                if (me.state.page == 'round') return;
                socket.emit(actions.problem, me.state.problem);
                if (me.state.page == 'problem') return;

                if (me.state.page == 'race') {
                    socket.emit(actions.racestart, Number(me.state.race));
                    return;
                }

                socket.emit(actions.info, me.raceTeams);

            }

        })


        socket.on('disconnect', () => {
            console.log('some one disconnected')
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
        try {

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
            me.state.race = -1;
            room.emit(actions.round, obj);
        } catch (e) {
            console.error(e)
        }
    }

    this.setProblem = function (problem) {
        try {

            var problem_info = contest.rounds[me.state.round.no].problems[problem];
            var obj = {
                no: problem,
                title: problem_info.title,
                choice: problem_info.choice,
                score: problem_info.score,
                content: problem_info.content
            }
            me.state.page = 'problem';
            me.state.problem = obj;
            me.state.race = -1;
            room.emit(actions.problem, obj);
        } catch (e) {
            console.error(e)
        }
    }

    this.update = function () {

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
            choice: [],
            score: 0,
        },
        info: {
            content: '',
            backgroundColor: ''
        },
        race: -1
    }

    this.state_any = function () {
        var obj = {}
        obj.teams = contest.teams.map(team => ({
            name: team.name,
            no: team.no,
            score: team.score,
            round: team.round,
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
    this.startRace = function (ms) {
        me.state.page = 'race';
        me.state.race = ms;
        if (ms == 0) {
            me.raceTeams = [];
            io.in(contestID_member).emit(actions.race, me.raceTeams);
        }
        room.emit(actions.racestart, ms);
    }

    this.race = function (no, answer) {

        // if (me.raceTeams.filter(x => x.no == no).length == 0)
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
        room.emit(actions.state, me.state_any());
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