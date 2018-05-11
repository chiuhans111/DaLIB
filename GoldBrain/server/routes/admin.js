var express = require('express');
var dog = require('../data/dog');

var adminkey = "dev-0-0";//dog.keygen(20);

var app = express.Router();
dog.mixin(app);

app.get('/isadmin', (req, res) => {
    res.send(req.dogauth(adminkey));
})


var adminapp = app.dog.routekey(adminkey);

adminapp.use((req, res, next) => {
    console.log('admin call');
    next();
})

adminapp.use(require('../data/api/admin.js'));

module.exports = app;