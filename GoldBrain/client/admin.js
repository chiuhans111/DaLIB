import Vue from "./lib/vuetify";

import admin from "./admin/admin.vue";
import my_dialog from './admin/my_dialog.vue'

Vue.component('admin', admin);
Vue.component('my-dialog', my_dialog);

new Vue({
    el: "#app"
})