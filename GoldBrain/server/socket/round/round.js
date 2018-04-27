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
    this.login = function (socket, key) {
        socket.emit('actions', actions);


        console.log('got connection');

        //// LOGIN

        if (socket.login) return true;
        console.log('login', key);
        var passed;

        if (key == me.viewKey) {
            // VIEWER Login

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

        } else if (key == contest.key) {
            console.log("MEMBER LOGINNED")
            // MEMBER Login

            socket.join(contestID);
            socket.join(contestID_member);
            socket.member = true;
            // MEMBER COMMUNICATION

            socket.on(actions.round, me.setRound);
            socket.on(actions.problem, me.setProblem);
            socket.on(actions.startrace, me.startRace);
            socket.on(actions.answer, me.answer);
            socket.on(actions.update, me.update);
            socket.on(actions.teamRound, data => {
                me.teamRound(data.teams, data.round)
            })
                // up to date
                ;
            (function () {
                socket.emit(actions.state, me.state_any());
                if (me.state.page == '') return;
                socket.emit(actions.round, me.state.round);
                if (me.state.page == 'round') return;
                socket.emit(actions.problem, me.state.problem);
                if (me.state.page == 'problem') return;
                if (me.state.page == 'race') {
                    socket.emit(actions.racestart, Number(me.state.race));
                    socket.emit(actions.race, me.raceTeams);
                }
            })();




            socket.login = true;
            sockets.push(socket);

        } else if ((passed = contest.teams.filter(team => key.includes(team.key))).length == 1) {
            // TEAM Login
            console.log("TEAM LOGINNED")

            var team = passed[0];

            if (me.onlineTeams[team.no]) {


                socket.emit(actions.showinfo, {
                    content: '請嘗試5秒後重新登入，並確保無其他登入中的裝置，',
                    backgroundColor: colors.error
                });
                socket.disconnect()
                return true;
            }


            if (team.round < me.state.round) {
                socket.emit(actions.showinfo, {
                    content: 'QQ 你已經被淘汰了',
                    backgroundColor: colors.error
                });
                socket.disconnect();
                return true;
            }

            socket.team = team;

            socket.join(contestID);
            socket.on(actions.race, answer => me.race(team.no, answer));
            me.onlineTeams[team.no] = socket;                 // online
            console.log('a team has joined us!!');

            // TEAM COMMUNICATION!
            socket.login = true;
            sockets.push(socket);
            var state = me.state_any();
            me.sendState(io.in(contestID).connected, me.state_any());



            // up to date
            (function () {
                socket.emit(actions.race, me.raceTeams);
                if (me.state.page == '') return;
                socket.emit(actions.round, me.state.round);
                if (me.state.page == 'round') return;
                socket.emit(actions.problem, me.state.problem);
                if (me.state.page == 'problem') return;

                if (me.state.page == 'race') {
                    socket.emit(actions.racestart, Number(me.state.race));
                    return;
                } else if (me.state.page == 'answered') {
                    socket.emit(actions.showinfo, {
                        content: "歡迎回來，請稍後將您加入比賽",
                        backgroundColor: colors.ok
                    })
                }
            })();
        }

        if (!socket.login) {
            return false;
        }

        console.log("register disconnect part");
        socket.on('disconnect', () => {
            console.log('some one disconnected')
            if (socket.team) {
                me.onlineTeams[socket.team.no] = false;          // offline
                console.log('team left:', socket.team.no);
                room.emit(actions.state, me.state_any());
            }
        })

        return true;

    }



    /**@type {Round} */
    var me = this;

    /**@type {type_contest} */
    this.contest = contest;


    this.sendState = function (sockets, state) {

        for (var i in sockets) {
            var socket = sockets[i];


            if (socket.team) {
                /*
                if (socket.team.round < me.state.round.no) {
                    socket.emit(actions.showinfo, {
                        content: '你已經被淘汰了',
                        backgroundColor: colors.error
                    });


                    continue;
                }*/

                state.team = socket.team.no;
            }
            else state.team = -1;
            socket.emit(actions.state, state);
        }
    }

    this.setRound = function (round) {
        try {

            //me.state.round = round;
            me.state.problem.no = 0;
            me.state.problem.info = null;
            var round_info = contest.rounds[round];
            var obj = {
                no: round,
                title: round_info.name,
                usebutton: round_info.usebutton,
                players: round_info.players
            }
            me.state.page = 'round';
            me.state.round = obj;
            me.state.race = -1;
            room.emit(actions.round, obj);

            me.sendState(io.in(contestID).connected, me.state_any());
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
        race: -1,
        raceStartTime: 0
    }

    this.state_any = function () {
        var obj = {}
        obj.teams = contest.teams.map(team => ({
            name: team.name,
            no: team.no,
            score: team.score,
            round: team.round,
            record: team.record,
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
            me.state.raceStartTime = new Date().getTime();
        }
        room.emit(actions.racestart, ms);
    }

    this.race = function (no, answer) {
        // check if already raced

        if (me.contest.teams[no].round < me.state.round.no) return;

        if (!me.raceTeams.some(x => x.no == no)) {

            me.raceTeams.push({
                no, answer, time: new Date().getTime() - me.state.raceStartTime
            })
            io.in(contestID_member).emit(actions.race, me.raceTeams);
        }
    }

    //// next round
    /**
     * set the team's round to some round
     * @param {Array<Number>} teams the Number of Teams
     * @param {Number} round the Round to be set
     */
    this.teamRound = function (teams, round) {
        me.contest.teams.map(team => {
            if (teams.indexOf(team.no) == -1 && team.round < round) return;
            team.round = round;
        })
        console.log(teams, round)
        me.contest.save();
        room.emit(actions.state, me.state_any());
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

        me.state.page = "answered";

        if (data == null) return; // 搶答

        data.filter(reply => reply.correct).map(reply => {
            var team = me.contest.teams[reply.team];
            if (team.record == null) team.record = [];

            if (reply.record) {
                reply.record.hash = JSON.stringify({
                    round: reply.record.round,
                    problem: reply.record.problem
                })
            }

            if (reply.record.hash) {   // checking
                if (team.record.some(r => r.hash == reply.record.hash)) return;
                team.record.push(reply.record);
            }
            team.score += reply.score;
        })

        me.contest.save();
        room.emit(actions.state, me.state_any());

        data.map(reply => {

            var team = me.onlineTeams[reply.team];
            if (team === false) return;

            if (!reply.hidden) team.emit(actions.showinfo, {
                content: `${reply.correct ? reply.score + '分\n恭喜答對' : '答錯了'}\n${reply.message}`,
                backgroundColor: reply.correct ? colors.ok : colors.error
            })
        })

    }

    this.stop = function () {
        console.log('round', viewKey, 'stopped');
        room.emit(actions.close, 'force stopped');
        me.showinfo('比賽已結束，若要重新連線請重新登入。');
        sockets.map(socket => {
            socket.disconnect(true);
        });
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