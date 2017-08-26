// Abandoned code

var ObjectID = require("mongodb").ObjectID;

var express = require('express');
var CRUD = require('./crud.js');

var objapi = require('../objapi.js');

var fields = {
    add: objapi.field('adding by count', {
        count: objapi.field('how many', 'number', x => x <= 50 ? true : "too many, max 50")
    }),

    del: objapi.field('delete by id', {
        ids: objapi.field('ids to be deleted', [
            objapi.field('object id', 'string', ObjectID.isValid)
        ], array => array.length > 0 ? true : 'must be a nonempty array')
    }),

    set_team: objapi.field('set team by id and obj', {
        id: objapi.field('team id', 'string'),
        value: objapi.field('TEAM', {
            name: objapi.optional(objapi.field('name of the team', 'string'))
        })
    }),

    player_set_team: objapi.field('set your team', {
        name: objapi.optional(objapi.field('name of the team', 'string'))
    }),

    set_problem: objapi.field('set problem by id and obj', {
        id: objapi.field('problem id', 'string', ObjectID.isValid),

        value: objapi.field('PROBLEM', {

            title: objapi.optional(objapi.field('problem title', 'string')),
            score: objapi.optional(objapi.field('score', 'number')),
            timeout: objapi.optional(objapi.field('time on the problem', 'number')),
            desc: objapi.optional(objapi.field('description of this problem', 'string')),
            choice: objapi.optional(objapi.field('choice', 'array')),
            answer: objapi.optional(objapi.field('answer', 'string')),
            answer_desc: objapi.optional(objapi.field('description of this answer', 'string')),
            result: objapi.optional(objapi.field('problem result', {
                team: objapi.field('team id', 'string', ObjectID.isValid),
                answer: objapi.field('answer', 'string')
            })),
        })
    }),

}

var masks = {
    player_set_team: objapi.mask({ name: true })
}


exports.admin = function ({ app, db }) {
    var crud = CRUD(db, app.dog);

    app.get('/team', (req, res) =>
        crud.team.get({}).then(r => res.send(r)));

    objapi.post(app, '/addteam', fields.add, (req, res) =>
        crud.team.add(req.body.count).then(r => res.send(r)));
    objapi.post(app, '/delteam', fields.del, (req, res) =>
        crud.team.del(req.body.ids).then(r => res.send(r)));
    objapi.post(app, '/setteam', fields.set_team, (req, res) =>
        crud.team.set(req.body.id, req.body.value).then(r => res.send(r)));

    app.get('/problem', (req, res) =>
        crud.problem.get({}).then(r => res.send(r)));
    objapi.post(app, '/addproblem', fields.add, (req, res) =>
        crud.problem.add(req.body.count).then(r => res.send(r)));
    objapi.post(app, '/delproblem', fields.del, (req, res) =>
        crud.problem.del(req.body.ids).then(r => res.send(r)));
    objapi.post(app, '/setproblem', fields.set_problem, (req, res) =>
        crud.problem.set(req.body.id, req.body.value).then(r => res.send(r)));
}


exports.team = function ({ app, db }) {
    var crud = CRUD(db, app.dog);



    var teamapp = express.Router();

    app.use((req, res, next) => {
        crud.team.get().then(teams => {
            var who = req.dogwho(teams);
            if (who.length == 0) return next();
            req.team = who[0];
            teamapp.handle(req, res, next);
        });
    })

    teamapp.get('/team', (req, res) =>
        crud.team.getbyid([req.team._id]).then(r => res.send(r)));

    objapi.post(teamapp, '/setteam', fields.player_set_team, (req, res) =>
        crud.team.set(req.team._id, masks.player_set_team(req.body)).then(r => res.send(r)));

    return teamapp;
}