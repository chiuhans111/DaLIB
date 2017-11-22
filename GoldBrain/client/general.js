
import Vuetify from "./lib/vuetify";
//import './web/daan.styl';
import './mainStyle.css';
import './web/dog';

import my_dialog from './admin/my_dialog.vue'
import { palette } from './web/palette.js';

var Vue = Vuetify({
    theme: {
        primary: palette.Orange.A100,
        accent: palette.Orange.A200,
        secondary: palette.Brown['100'],
        info: palette.Blue.A100,
        warning: palette.Amber.A100,
        error: palette.Red.A200,
        success: palette.Green.A200
    }
})

Vue.component('my-dialog', my_dialog);

window.Vue = Vue;
window.done = function (data) {
    return new Vue({
        el: "#app",
        data
    })
}
