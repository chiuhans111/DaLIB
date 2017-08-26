var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.schema = new Schema({
    key: String,

    name: String,
    rounds: [
        {
            players: Number,    // 多少人可以參加這一輪
            name: String,
            problems: [
                {
                    title: String,
                    content: String,
                    choise: [   // 選擇題選項
                        {
                            name: String,   // 選項
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