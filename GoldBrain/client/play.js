import Vue from 'vue';
import './mainStyle.css'

import cir from './play/cir.vue';
import answer from './play/answer.vue';
import score from './play/score.vue';
import slides from './play/slides.vue';
import fbtn from './play/fbtn.vue';
import play from './play/play';
import { setInterval } from 'timers';

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
        },
        roundStart() {
            play.emit('problem', 0);
        },
        goRound() {
            play.emit('round', this.round.no);
        },
        problemStart(race) {
            timestamp = -1000;
            raceCountDown = race;
        },
        nextProblem() {
            play.emit('problem', this.problem.no + 1)
        },
        nextRound() {
            play.emit('round', this.round.no + 1)
        },
        prevRound() {
            play.emit('round', this.round.no - 1)
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
        answer() {
            return this.problemc.choice.map(x => ({
                value: x.value,
                content: x.content,
                team: this.races.filter(y => y.answer == x.value),
                correct: x.value == this.problemc.answer.value
            }))
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