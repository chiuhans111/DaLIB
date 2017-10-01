import Vue from 'vue'
import Vuetify from 'vuetify'
import my_dialog from './vue/my_dialog.vue'
Vue.use(Vuetify);
Vue.component('my-dialog', my_dialog);
var css = `<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' rel="stylesheet" type="text/css">
    <link href="/style/vuetify.min.css" rel="stylesheet" type="text/css">
    <link href="/style/main.css" rel="stylesheet" type="text/css">`

document.head.innerHTML += css;

console.log('success');

export default Vue;