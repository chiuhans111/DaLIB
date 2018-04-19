
import Vuetify from "./lib/vuetify";
//import './web/daan.styl';
import './web/dog';

import './mainStyle.css';
import my_dialog from './admin/my_dialog.vue'
import { palette } from './web/palette.js';

var Vue = Vuetify({
    theme: {
        primary: palette.Orange[500],
        accent: palette.Orange[300],
        secondary: palette.Orange[700],
        info: palette.Cyan[700],
        warning: palette.Amber[500],
        error: palette.Red[500],
        success: palette.Green[500]
    }
})

Vue.component('my-dialog', my_dialog);

// hi

window.Vue = Vue;
window.done = function (obj) {
    if (!obj.el) obj.el = '#app';
    return new Vue(obj)
}
export default Vue;
