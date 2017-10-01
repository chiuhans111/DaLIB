import Vue from "./common";

var data = {
    state: { teams: "loading" },
    round: {},
    problem: {},
    race: {}
}

new Vue({
    el: "#app",
    data
})

var io = window.io;

var socket = io('/round');

socket.on('state', state => {
    var s = {};
    if (state.team != null)
        s.team = state.team;
    s.teams = state.teams;

    data.state = s;
})

socket.on('round', round => data.round = round);
socket.on('problem', problem => data.problem = problem);
socket.on('race', race => data.race = race);


// login
var key = location.href.match(/key\/(.+)/)[1];
socket.emit('login', key);

window.data = data;