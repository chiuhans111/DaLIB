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
    var promise_return = function () { }
    var promise = new Promise(done => {
        promise_return = done;
    })

    function tryConnect() {
        mongoose.connect(url).then(_ => {
            console.log('mongoose connected');
            return db.connect(url); // note: This returns a Promise !!
        }).then(db=>{
            mongoose.db = db;
            promise_return(mongoose);

        }).catch(error => {
            console.error("connecting DB error");
            console.error("please check is DB opened");
            console.error("try again in 5 second");
            setTimeout(function () {
                console.log('after five seconds...')
                tryConnect();
            }, 5000);
        })
    }

    tryConnect();
    return promise;
}


/**@type {Promise.<_MG>} */
module.exports = connect(url);