import Vue from './general.js';

import problem from './play/problem.vue';
import answer from './play/answer.vue';
import score from './play/score.vue';

Vue.component('problem', problem);
Vue.component('answer', answer);
Vue.component('score', score);

import play from './play/play.js';

import dog from './web/dog.js';
dog.keyrequest('/api/')