module.exports = {
    keygen,
    xor,
    displace,
    SKeygen
}

/**
 * @param {Number} s max random number can be ( not included )
 * @return {Number} random number
 */
function randomi(s) {
    var result = Math.random() * s;
    return Math.floor(result);
}

function padStart(x, y, z) {
    if (x.length < y) return padStart(z + x, y, z);
    else return x;
}

function padEnd(x, y, z) {
    if (x.length < y) return padStart(x + z, y, z);
    else return x;
}

enBase64 = data => Buffer(data).toString("base64");
deBase64 = data => Buffer.from(data, "base64").toString();
//       0, 1, 2, 3, 4, 5, 6, 7, 8, 9
map1a = [7, 5, 9, 4, 8, 0, 3, 1, 6, 2];
map1b = [5, 7, 9, 6, 3, 1, 8, 0, 4, 2];
//       0, 1, 2
map2a = [1, 2, 0];
map2b = [2, 0, 1];


function displace(str, map, reverse) {
    if (!reverse) {
        var added = 1;
        while ((str.length + 1) % map.length != 0) {
            str += String.fromCharCode(Math.floor(Math.random() * 256));
            added++;
        }
        str += String.fromCharCode(added);
    }

    var str2 = Array(str.length).fill(' ');


    for (var i = 0; i < str.length; i++) {
        var x = i % map.length;
        var y = Math.floor(i / map.length);
        var x2 = map[x];
        str2[y * map.length + x2] = str[i];
    }

    var str3 = str2.join('');

    if (reverse) {
        var count = str3.charCodeAt(str3.length - 1);
        str3 = str3.substr(0, str3.length - count);
    }

    return str3;
}

var incr = 0;
function keygen(randomSize) {
    var time = new Date().getTime();
    var data = [];
    while (time > 0) {
        data.push(time % 256);
        time = Math.floor(time / 256);
    }
    data.unshift(data.length);
    data.push(incr);

    incr = (incr + 1) % 256;

    data.push(...[...Array(randomSize)]
        .map(x => Math.floor(Math.random() * 256)));

    return enBase64(Buffer(data));
}

function bufferValue(number, length) {
    var arr = [];
    while (number > 0) {
        arr.unshift(number % 256);
        number = Math.floor(number / 256)
    }

    if (arr.length < length) arr.unshift(0);

    return Buffer(arr);
}


function xor(a, b) {
    /**@type {Array.<Number>} */
    var da = a.toJSON().data;
    /**@type {Array.<Number>} */
    var db = b.toJSON().data;
    var arr = [];
    for (var i = 0; i < da.length && i < db.length; i++) {
        var na = da[i];
        var nb = db[i];
        arr.push(na ^ nb);
    }
    return Buffer(arr);
}

/**provides simple random string that is human can read/write it */
function SKeygen(number, seed) {

    number = bufferValue(number, seed.length / 2);
    seed = Buffer(seed);

    code = xor(number, seed);

    return code.toString('hex');
}