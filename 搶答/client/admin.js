import Vue from "./common";

import admin from "./vue/admin.vue"
Vue.component('admin', admin);

new Vue({
    el: "#app"
})