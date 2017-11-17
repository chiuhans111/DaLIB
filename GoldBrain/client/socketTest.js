import Vue from "./lib/vuetify";

var data = {
    state: { teams: "loading" },
    round: {},
    problem: {},
    race: {},
    info: {},
    racestart: -1
}



var io = window.io;

var socket = io('/round');

socket.on('state', state => {
    var s = {};
    if (state.team != null)
        s.team = state.team;
    s.teams = state.teams;

    data.state = s;
})

socket.on('round', round => console.log(data.round = round));
socket.on('problem', problem => console.log(data.problem = problem));
socket.on('race', race => console.log(data.race = race));
socket.on('racestart', ms => console.log(data.racestart = ms));
socket.on('showinfo', info => console.log(data.info = info));
window.socket = socket;

// login
var key = location.href.match(/key\/(.+)/)[1];
socket.emit('login', key);

window.data = data;

new Vue({
    el: "#app",
    data
})