var express = require('express');

var contestAPI = require('../data/api/contest');

exports.connect = function (db) {

    var app = express.Router();
    app.use((req, res, next) => {
        console.log(req.body);
        next();
    })

    app.use('/admin', require('./admin'));
    app.use('/member', require('./member'));
    app.use('/team', require('./team'));
    app.use('/qrcode', require('./qrcode'));

    // any
    app.use('/contest', contestAPI.any);

    return app;

}