// generate qrcode
// encode to png tag or terminal form

var qr = require('qrcode');
exports.png = function (data) {
    return new Promise(done => {
        qr.toDataURL(data, { errorCorrectionLevel: 'L' }, function (err, url) {
            done(url);
        })
    })
}

exports.terminal = function (data) {
    qr.toString(data, {
        type: "terminal"
    }, function (err, str) {
        var formatter = [];
        str = str.replace(/[^ ^\n]+\[(\d+)m  /g, (x, a) => a == '40' ? '\x1b[0m\x1b[40m　' : '\x1b[0m\x1b[47m▉');
        str = str.replace(/\u001b\[0m\n/g, '\n')
        console.log(str + '\x1b[0m');
    })
}