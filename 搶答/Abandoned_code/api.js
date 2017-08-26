// todo: finish translation

var api = require('tool/api.js');
var ObjectID = require("mongodb").ObjectID;

exports.add = api.api([Object, 'adding by count', {
    count: [Number, 'how many', api.valid(x => x <= 50, 'max 50')]
}])
exports.del = api.api([Object, 'delete by id', {
    ids: [Array, 'ids to be deleted',
        [String, app.valid(ObjectID.isValid, 'match object id')],
        api.valid(a => a.length > 0, 'cannot be empty')]
}])
exports.set_team = api.api([Object, 'set team by id and value', {
    id: [String, 'team id', app.valid(ObjectID.isValid, 'match object id')],
    value: [Object, {
        name: [String, 'name of the team', api.optional]
    }]
}])
exports.set_team = api.api([Object, 'set team by id and value', {
    id: [String, 'team id', app.valid(ObjectID.isValid, 'match object id')],
    value: [Object, {
        name: [String, 'name of the team', api.optional]
    }]
}])

var fields = {

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
        id: objapi.field('problem id', 'string'),

        value: objapi.field('PROBLEM', {

            title: objapi.optional(objapi.field('problem title', 'string')),
            choise: objapi.optional(objapi.field('choise', 'array')),
            timeout: objapi.optional(objapi.field('timeout', 'number')),
            desc: objapi.optional(objapi.field('description of this problem', 'string')),
            answer: objapi.optional(objapi.field('answer', 'string')),
            result: objapi.optional(objapi.field('problem result', 'array')),
        })
    }),

}
