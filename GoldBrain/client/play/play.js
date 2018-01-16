import dog from '../web/dog';
import { login } from '../../server/socket/round/actions';

var data = {
    content: {},
    state: { teams: "loading" },
    round: { title: '', no: -1 },
    problem: {},
    race: {},
    info: {},
    racestart: -1,
    page: '',
    slides: true,
    answerTeam: null
}
window.data = data;
var io = window.io;

var socket = io('/round');

socket.on('state', state => {
    var s = {};
    if (state.team != null)
        s.team = state.team;
    s.teams = state.teams;

    data.state = s;
})

socket.on('round', round => {
    console.log(data.round = round)
    if (data.round.no != -1)
        data.page = 'round';
});
socket.on('problem', problem => {
    data.racestart = -1;
    if (data.round.no != -1)
        data.page = 'problem';
    console.log(data.problem = problem)
});
socket.on('race', race => {
    console.log(data.race = race)
});
socket.on('racestart', ms => {
    if (data.round.no != -1)
        data.page = 'racestart';
    console.log(data.racestart = ms)
});
socket.on('showinfo', info => {
    if (data.round.no != -1)
        data.page = 'showinfo';
    console.log(data.info = info)
});
window.socket = socket;

// login
var key = location.href.match(/key\/(.+)/)[1];

var logined = false;
export default {
    emit: function () {
        socket.emit(...arguments)
    },
    data,
    login: function () {
        if (logined) return;
        logined = true;
        socket.emit('login', key);
        dog.keyrequest('get', '/api/member/contest/view/').then(dog.json).then(obj => {
            data.content = obj;
        })
    }
};