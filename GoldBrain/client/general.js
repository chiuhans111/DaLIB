
import Vuetify from "./lib/vuetify";
//import './web/daan.styl';
import './mainStyle.css';
import './web/dog';

import my_dialog from './admin/my_dialog.vue'
import { palette } from './web/palette.js';

var Vue = Vuetify({
    theme: {
        primary: palette.Orange[500],
        accent: palette.Orange[300],
        secondary: palette.Orange[700],
        info: palette.Blue[500],
        warning: palette.Amber[500],
        error: palette.Red[500],
        success: palette.Green[500]
    }
})

Vue.component('my-dialog', my_dialog);

window.Vue = Vue;
window.done = function (obj) {
    if (!obj.el) obj.el = '#app';
    return new Vue(obj)
}
