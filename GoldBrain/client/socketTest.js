import Vuetify from "./lib/vuetify";

var Vue = Vuetify({})


var io = window.io;

var socket = io('/round');

var data = {
    socket,
    team: null,
    state: {},
    round: {},
    problem: {},
    race: {},
    info: {},
    page: '',
    answered: null,
    racestart: -1
}




socket.on('state', state => {

    if (state.team != null)
        data.team = state.team;

    data.state = state;

})

socket.on('round', round => {
    console.log(data.round = round);
    data.page = 'round';
});
socket.on('problem', problem => {
    console.log(data.problem = problem);
    data.page = 'problem';
    data.answered = null;
});
socket.on('race', race => {
    console.log(data.race = race);
});
socket.on('racestart', ms => {
    console.log(data.racestart = ms);
    data.page = 'racestart';
});
socket.on('showinfo', info => {
    console.log(data.info = info);
    data.page = 'info';
});
window.socket = socket;

// login
var key = location.href.match(/key\/(.+)/)[1];
socket.emit('login', key);

window.data = data;

new Vue({
    el: "#app",
    data,
    computed: {
        score() {
            if (this.state.teams) return this.state.teams[this.team].score;
        },
        answerable() {
            return this.page == 'racestart' && this.racestart == 0 && this.answered == null;
        }
    },
    methods: {
        answer(i) {
            if (!this.answerable) return;
            console.log(i);
            if (!this.round.usebutton)
                this.answered = i;
            socket.emit('race', i);
        }
    }
})

document.body.hidden = false;