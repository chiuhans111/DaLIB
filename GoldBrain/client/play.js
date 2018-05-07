import Vue from 'vue';
import './mainStyle.css'

import cir from './play/cir.vue';
import answer from './play/answer.vue';
// import score from './play/score.vue';
import slides from './play/slides.vue';
import fbtn from './play/fbtn.vue';

import play from './play/play';
// import ranking from './play/ranking';

import { setInterval } from 'timers';
import { teamRound } from '../server/socket/round/actions';


Vue.component('cir', cir);
Vue.component('answer', answer);
// Vue.component('score', score);
Vue.component('slides', slides);
Vue.component('fbtn', fbtn);

var raceCountDown = -1;
var problemTimestamp = 0;
var onProblemTimeout;

var timestamp = 0;


function update() {
    var now = new Date().getTime();

    // countdown for races
    if (raceCountDown >= 0) {
        if (now - timestamp >= 1000) {

            timestamp = now;

            console.log("countdown", raceCountDown)
            play.emit('startrace', raceCountDown);
            raceCountDown -= 1000;
        }
    }

    // countdown for problems
    if (onProblemTimeout instanceof Function) {
        data.problemTime = now - problemTimestamp;
        if (data.problemTime / 1000 >= app.problemc.timeout) {
            console.log("timesup!");
            onProblemTimeout();
            onProblemTimeout = null;
        }
    }


    requestAnimationFrame(update);
}
update();
play.login();

// mixins to the play data
play.data.problemTime = 0;

var app = new Vue({
    data: play.data,
    el: '#app',
    methods: {
        go() {
            this.slides = false;
            if (this.round.no == -1) play.emit('round', 0);
        },
        roundStart() {
            raceCountDown = -1;
            play.emit('problem', 0);
            console.log('start');
        },
        goRound(round) {
            if (round == null) round = this.round.no;


            play.emit('teamRound', {
                teams: this.rank.teams.map(x => x.no),
                round
            });

            raceCountDown = -1;
            onProblemTimeout = null;

            play.emit('round', round);
        },
        problemStart(race, type) {
            if (type == 1)
                onProblemTimeout = function () {
                    app.answer(type);
                }
            problemTimestamp = new Date().getTime();
            raceCountDown = race;
        },

        nextProblem() {
            play.emit('problem', this.problem.no + 1);
            raceCountDown = -1;
            onProblemTimeout = null;
        },
        nextRound() {
            this.goRound(this.round.no + 1);
        },
        prevRound() {
            this.goRound(this.round.no - 1);
        },


        answer(type) {
            onProblemTimeout = null;
            if (type == 1) {
                var result = this.races.map(x => ({
                    correct: x.answer == this.problemc.answer.value,
                    team: x.no,
                    message: '',
                    score: this.problemc.score,
                    time: x.time,
                    value: x.answer,
                    record: ({
                        value: x.answer,
                        round: this.round.no,
                        problem: this.problem.no,
                        time: x.time,
                        score: this.problemc.score,
                        correct: x.answer == this.problemc.answer.value
                    })
                }))
                play.emit('answer', result);
                this.answerResult = result;
            } else play.emit('answer', null);


            this.page = 'answer';
            raceCountDown = -1;
            onProblemTimeout = null;
        },
        answerCorrect() {
            play.emit('answer', [
                {
                    correct: true,
                    team: this.answerTeam.no,
                    message: '',
                    score: this.problemc.score,
                    record: ({
                        round: this.round.no,
                        problem: this.problem.no,
                        time: this.answerTeam.time,
                        score: this.problemc.score,
                        correct: true
                    })
                }
            ]);
            this.page = 'answer'
        },
        lineBreakFixer(text) {
            return text.replace(/[^，,。、\s]/g, "$&\u2060");
        },
        logout() {
            play.logout();
        }

    },
    computed: {



        races() {
            var obj = {};
            if (this.race.filter)
                return this.race.filter(x => {
                    var has = obj[x.no];
                    obj[x.no] = true;
                    return !has;
                })
            else return [];
        },
        players() {
            return this.state.teams.filter(x => x.online && x.round >= this.round.no)
        },
        roundc() {
            return this.content.rounds[this.round.no];
        },
        problemc() {
            return this.roundc.problems[this.problem.no]
        },


        problemTime_second() {
            if (this.racestart == -1) return this.problemc.timeout;
            else return this.problemc.timeout - this.problemTime / 1000
        },
        problemTime_isBegin() {
            return this.problemTime / 1000 < this.problemc.timeout

        },


        problemTime_format() {
            var time = this.problemTime_second
            var centi = Math.floor(time * 10) % 10;
            var sec = Math.floor(time) % 60;
            var min = Math.floor(time / 60) % 60;
            var hour = Math.floor(time / 60 / 60) % 60;
            var unit = 'sec';
            if (min > 0) unit = 'min'
            if (hour > 0) unit = 'hour'
            return {
                centi, sec, min, hour, unit
            }
        },
        problemTime_text_big() {
            var time = this.problemTime_format
            if (time.unit == 'hour') return time.hour
            if (time.unit == 'min') return time.min
            if (time.unit == 'sec') return time.sec
        },
        problemTime_text_small() {
            var time = this.problemTime_format
            if (time.unit == 'hour') return ':' + time.min + '分鐘'
            if (time.unit == 'min') return ':' + time.sec + '秒'
            if (time.unit == 'sec') return '.' + time.centi + '秒'
        },
        rank() {
            var teams = [];
            try {

                teams = this.state.teams.map(x => ({
                    no: x.no,
                    name: x.name,
                    round: x.round,
                    score: x.score,
                    record: x.record,
                    online: x.online,
                    rank: x.rank,
                    scores: x.scores,
                    time: x.time
                }))
            } catch (e) {
                console.error(e);
            }

            /* // implemented rank in server, remove client ranking.
            // from ranking.js
            teams = ranking.rank(teams, this.content.rounds.length);
            */

            var players = 1;
            // if still have next round, 'players' can win is determin by next round's players count
            if (this.round.no + 1 < this.content.rounds.length)
                players = this.content.rounds[this.round.no + 1].players;


            var same = [];
            var other = [];

            // if score is equall to the lowest player's score, you still have chance
            if (teams.length > players)
                teams.slice(players).map(team => {
                    if (team.score == teams[players - 1].score) same.push(team);
                    else other.push(team);
                });

            teams = teams.slice(0, players);

            var all = [];
            var i = -1;

            teams.map(team => {
                team.type = 0;
                all.push(team);
            })

            same.map(team => {
                team.type = 1;
                all.push(team);
            })

            other.map(team => {
                team.type = 2;
                all.push(team);
            })
            /*
            var last = null;
            var currentRank = all.length;
            // from bottom to top, same score, same rank
            for (var i = all.length - 1; i >= 0; i--) {
                if (all[i].score != last) currentRank = i;
                all[i].rank = currentRank;
                last = all[i].score;
            }*/

            return {
                teams,
                same,
                other,
                all
            }
        },
        hasNextProblem() {
            return this.problem.no < this.roundc.problems.length - 1;
        },
        hasNextRound() {
            return this.round.no < this.content.rounds.length - 1;
        },
        hasPrevRound() {
            return this.round.no > 0
        }
    }
})

window.app = app;

if (location.href.match(/\?skip/)) app.go();


document.body.hidden = false;