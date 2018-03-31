import Vue from 'vue';
import './mainStyle.css'

import cir from './play/cir.vue';
import answer from './play/answer.vue';
import score from './play/score.vue';
import slides from './play/slides.vue';
import fbtn from './play/fbtn.vue';

import play from './play/play';
import ranking from './play/ranking';

import { setInterval } from 'timers';
import { teamRound } from '../server/socket/round/actions';


Vue.component('cir', cir);
Vue.component('answer', answer);
Vue.component('score', score);
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
        },
        nextRound() {
            this.goRound(this.round.no + 1);
        },
        prevRound() {
            this.goRound(this.round.no - 1);
        },


        answer(type) {

            if (type == 1) {
                var result = this.races.map(x => ({
                    correct: x.answer == this.problemc.answer.value,
                    team: x.no,
                    message: '',
                    score: this.problemc.score,
                    time: x.time,
                    record: ({
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
        rank() {
            var teams = this.state.teams.map(x => ({
                no: x.no,
                name: x.name,
                round: x.round,
                score: x.score,
                record: x.record,
                online: x.online
            }))

            // from ranking.js
            teams = ranking.rank(teams, this.content.rounds.length);

            /*
            // moved to ranking.js

            teams.map(team => {
                team.time = [];
                team.scores = [];
                for (var i in this.content.rounds) {
                    try {

                        var t = team.record.filter(r => r.round == i && r.correct)

                        var ts = t.map(x => x.time).reduce((a, b) => a + b, 0);

                        var s = t.map(x => x.score).reduce((a, b) => a + b, 0);
                        ts /= t.length;

                        team.time[i] = ts;
                        team.scores[i] = s;

                    } catch (e) {
                        team.time[i] = null;
                    }
                }
            })

            teams.sort((a, b) => {
                var rank = b.score - a.score;
                if (rank == 0) {

                    try {
                        var i = 0;
                        while (rank == 0 && i <= this.round.no) {
                            rank = a.time[this.round.no - i] - b.time[this.round.no - i];
                            if (isNaN(rank)) throw new Error("speed not valid");
                            i++;
                        }
                    } catch (e) {
                        rank = 0;
                        if (e.message != 'speed not valid')
                            console.error(e)
                    }
                }
                if (rank == 0) rank = a.no - b.no;

                return rank;
            });*/

            var players = 1;
            if (this.round.no + 1 < this.content.rounds.length)
                players = this.content.rounds[this.round.no + 1].players;

            var same = [];
            var other = [];
            if (teams.length > players)
                teams.slice(players).map(team => {
                    if (team.score == teams[players - 1].score) same.push(team);
                    else other.push(team);
                });
            teams = teams.slice(0, players);

            var all = [];
            var i = -1;
            var last = null;

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

            all.map(team => {
                if (last != team.score) {
                    last = team.score;
                    i++;
                }
                team.rank = i;
            })

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