import Vue from 'vue'
import Vuetify from 'vuetify'

import 'vuetify.css';
import 'material-icons.css';

console.log('success');

export default function (setup) {
    Vue.use(Vuetify, setup);
    return Vue;
};