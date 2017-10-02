var socket = require('socket.io');
// TYPE HELPERS
var type_socket_io = socket();

var app = require("../webpage/web.js");

/**@type {Promise.<type_socket_io>} */
module.exports = new Promise(done => {
    var io = socket(app.server, {
        pingInterval: 4000,
        pingTimeout: 2000
    });
    done(io);
})