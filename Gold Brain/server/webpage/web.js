var express = require("express"),
    bodyparser = require("body-parser"),
    morgan = require('morgan');

var dog = require("tool/dog");

app = express();

app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ type: 'application/*' }));

dog.watch(app);

app.listen(80);
app.use(function (error, req, res, next) {
    if (error) res.send({ error: error.message });
    else next();
});

module.exports = app;