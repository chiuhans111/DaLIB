
import Vue from "./lib/vuetify";
import './web/daan.styl';
import './mainStyle.css';
import './web/dog';

import my_dialog from './admin/my_dialog.vue'
Vue.component('my-dialog', my_dialog);

window.Vue = Vue;
window.done = function (data) {
    return new Vue({
        el: "#app",
        data
    })
}