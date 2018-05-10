// security web with watching dog

// 1. generate secure key
// 2. provide key varify method

var express = require('express');
var crypt = require('../crypt');


exports.keygen = crypt.keygen;

exports.mixin = function (app) {
    app.dog = {
        keygen: exports.keygen,
        Router: function () {
            var newApp = express.Router();
            exports.mixin(newApp);
            return newApp;
        },
        routekey: function (key) {
            var passedApp = express.Router();
            exports.mixin(passedApp);
            app.use(passedApp);
            passedApp.use((req, res, next) => {
                if (req.dogauth(key)) return next();
                console.log('key not match', key, req.dogcode);
                res.send('key not match');
            })
            return passedApp;
        },
        block: function ({ rule = _ => true, message = 'BLOCKED, please check your premission' }) {
            return function (req, res, next) {
                if (rule(req)) res.send(message);
                else next();
            }
        }
    }
}

// app.use(this.watch)
exports.watch = function (app) {
    exports.mixin(app);

    app.use((req, res, next) => {
        var match = req.url.match(/(\/.+?)?\/key([A-Za-z0-9\/\+\-=]+)/);
        var keycode = "";

        if (match !== null) {
            keycode = match[2];
            req.url = match[1] || "/";
        }
        req.dog = {
            keygen: exports.keygen
        }
        req.dogcode = keycode;
        req.dogauth = key => keycode.includes(key);

        req.dogwho = function (keypairs) {
            return keypairs
                .filter(pair => keycode.includes(pair.key));
        }
        next();
    });
}