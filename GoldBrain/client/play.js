import Vue from 'vue';
import './mainStyle.css'

import problem from './play/problem.vue';
import answer from './play/answer.vue';
import score from './play/score.vue';
import slides from './play/slides.vue';
import fbtn from './play/fbtn.vue';
import play from './play/play';
import { setInterval } from 'timers';

Vue.component('problem', problem);
Vue.component('answer', answer);
Vue.component('score', score);
Vue.component('slides', slides);
Vue.component('fbtn', fbtn);

var raceCountDown = -1;

function update() {
    if (raceCountDown >= 0) {
        console.log("countdown", raceCountDown)
        play.emit('startrace', raceCountDown);
        raceCountDown--;
    }
}

setInterval(() => {
    update();
}, 1000);

var app = new Vue({
    data: play.data,
    el: '#app',
    methods: {
        go() {
            this.slides = false;
            play.login();
        },
        roundStart() {
            play.emit('problem', 0);
        },
        problemStart(race) {
            raceCountDown = race;
        }
    },
    computed: {
        races() {
            var obj = {};
            return this.race.filter(x => {
                var has = obj[x.no];
                obj[x.no] = true;
                return !has;
            })
        }
    }
})