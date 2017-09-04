var socket = require('socket.io');
// TYPE HELPERS
var type_socket_io = socket();

var app = require("../webpage/web.js");

/**@type {Promise.<type_socket_io>} */
module.exports = new Promise(done => {
    var io = socket(app.server, null);
    done(io);
})