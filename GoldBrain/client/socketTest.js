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
    console.log('state', state);
    if (state.team != null)
        data.team = state.team;

    data.state = state;

})

socket.on('round', round => {
    console.log('round', data.round = round);
    data.page = 'round';
});
socket.on('problem', problem => {
    console.log('problem', data.problem = problem);
    data.page = 'problem';
    data.answered = null;
});
socket.on('race', race => {
    console.log('race', data.race = race);
});
socket.on('racestart', ms => {
    console.log('racestart', data.racestart = ms);
    data.page = 'racestart';
});
socket.on('showinfo', info => {
    console.log('info', data.info = info);
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
            if (this.state.teams) {
                var team = this.state.teams.filter(team => team.no == data.team)[0]
                if (team) return team.score;
            }
            return 0;
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