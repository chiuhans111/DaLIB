var mongoose = require('mongoose');
var mongo = require("mongodb");
mongoose.Promise = Promise;
var db = mongo.MongoClient;


var _DB = mongo.Db;
var _MG = mongoose;

// change db url here
var url = "mongodb://admin:dalibadmin@localhost:27017/dalib";

function connect(url) {
    return mongoose.connect(url, { useMongoClient: true }).then(_ => {
        console.log('connected');
        return db.connect(url);
    }).then(db => {
        mongoose.db = db;
        return mongoose;
    }).catch(retry);
}

function retry() {
    console.error("connecting DB error");
    console.error("please check is DB opened");
    console.error("try again in 5 second");
    return new Promise(done => {
        setTimeout(function () {
            done(connect())
        }, 5000);
    })
}

/**@type {Promise.<_MG>} */
module.exports = connect(url);