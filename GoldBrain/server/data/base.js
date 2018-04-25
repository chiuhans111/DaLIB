var mongoose = require('mongoose');
var mongo = require("mongodb");
mongoose.Promise = Promise;
var db = mongo.MongoClient;


var _DB = mongo.Db;
var _MG = mongoose;

var config = require('../config/config');
// change db url here
var url = config.db;

function connect(url) {
    console.log('connecting to db...')
    return mongoose.connect(url).then(_ => {
        console.log('connected');
        return db.connect(url);
    }).then(db => {
        mongoose.db = db;
        return mongoose;
    }).catch(retry);
}

function retry(error) {
    mongoose.disconnect();
    console.error("connecting DB error");
    console.error("please check is DB opened");
    console.error("try again in 5 second");
    return new Promise(done => {
        setTimeout(function () {
            var result = connect();
            done(result);
        }, 5000);
    })
}

/**@type {Promise.<_MG>} */
module.exports = connect(url);