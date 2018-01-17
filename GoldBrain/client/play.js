import Vue from 'vue';
import './mainStyle.css'

import cir from './play/cir.vue';
import answer from './play/answer.vue';
import score from './play/score.vue';
import slides from './play/slides.vue';
import fbtn from './play/fbtn.vue';
import play from './play/play';
import { setInterval } from 'timers';
import { teamRound } from '../server/socket/round/actions';

Vue.component('cir', cir);
Vue.component('answer', answer);
Vue.component('score', score);
Vue.component('slides', slides);
Vue.component('fbtn', fbtn);

var raceCountDown = -1;

var timestamp = 0;

function update() {
    var now = new Date().getTime();
    if (now - timestamp >= 1000) {

        timestamp = now;

        if (raceCountDown >= 0) {
            console.log("countdown", raceCountDown)
            play.emit('startrace', raceCountDown);
            raceCountDown -= 1000;
        }
    }
    setTimeout(() => {
        update();
    }, 16);
}
update();
play.login();

var app = new Vue({
    data: play.data,
    el: '#app',
    methods: {
        go() {
            this.slides = false;
            if (this.round.no == -1) play.emit('round', 0);
        },
        roundStart() {
            play.emit('problem', 0);
        },
        goRound(round) {
            if (round == null) round = this.round.no;


            play.emit('teamRound', {
                teams: this.rank.teams.map(x => x.no),
                round
            });

            play.emit('round', round);
        },
        problemStart(race) {
            timestamp = -1000;
            raceCountDown = race;
        },
        nextProblem() {
            play.emit('problem', this.problem.no + 1)
        },
        nextRound() {
            this.goRound(this.round.no + 1)
        },
        prevRound() {
            this.goRound(this.round.no - 1)
        },


    },
    computed: {
        races() {
            var obj = {};
            return this.race.filter(x => {
                var has = obj[x.no];
                obj[x.no] = true;
                return !has;
            })
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
                score: x.score
            }))

            teams.sort((a, b) => {
                var rank = b.score - a.score;
                if (rank == 0) rank = b.round - a.round;
                if (rank == 0) rank = a.no - b.no;
                return rank;
            });

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
            var i = 0;
            teams.map(team => {
                team.rank = i++;
                team.type = 0;
                all.push(team);
            })

            same.map(team => {
                team.rank = i++;
                team.type = 1;
                all.push(team);
            })

            other.map(team => {
                team.rank = i++;
                team.type = 2;
                all.push(team);
            })

            return {
                teams,
                same,
                other,
                all
            }
        },
        answer() {
            var result = this.races.map(x => ({
                correct: x.answer == this.problemc.answer.value,
                team: x.no,
                message: '',
                score: this.problemc.score,
                time: x.time,
                hash: JSON.stringify({
                    round: this.round.no,
                    problem: this.problem.no
                })
            }))
            play.emit('answer', result);
            return result;
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