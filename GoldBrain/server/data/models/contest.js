var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.mask = {
    any: {
        name: 1,
        _id: 0,

        'rounds.name': 1,
        'rounds.content': 1,

        'teams.no': 1,
        'teams.name': 1,
        'teams.score': 1,
        'teams.round': 1
    }
}

exports.schema = new Schema({
    key: String,

    name: String,
    rounds: [
        {
            players: Number,    // 多少人可以參加這一輪
            name: String,
            usebutton: Boolean,
            problems: [
                {
                    title: String,
                    content: String,
                    choice: [   // 選擇題選項
                        {
                            value: String,   // 選項
                            content: String // 內容
                        }
                    ],
                    timeout: Number,    // 作答時間
                    answer: {
                        value: String,      // 答案
                        description: String // 原因
                    },
                    score: Number // 得分
                }
            ],
        }
    ],
    teams: [
        {
            no: Number,
            name: String,
            key: String,
            score: Number,
            round: Number
        }
    ]
});

/**
 * 
 * @typedef {Object} Answer
 * @property {String} value
 * @property {String} description
 * 
 * @typedef {Object} Choice
 * @property {String} value
 * @property {String} content
 * 
 * @typedef {Object} Problem
 * @property {String} title
 * @property {String} content
 * @property {Array.<Choice>} choice
 * @property {Number} timeout
 * @property {Answer} answer
 * @property {Number} score
 * 
 * @typedef {Object} Round
 * @property {Number} players
 * @property {String} name
 * @property {Boolean} usebutton
 * @property {Array.<Problem>} problems
 * 
 * @typedef {Object} Team
 * @property {Number} no
 * @property {String} name
 * @property {String} key
 * @property {Number} score
 * @property {Number} round
 */

function Type() {
    /**@type {String} */
    this.key = '';
    /**@type {String} */
    this.name = '';
    /**@type {Array.<Round>}*/
    this.rounds = [];
    /**@type {Array.<Team>} */
    this.teams = [];
}

exports.type = Type;
