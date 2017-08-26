var dog = {
    url: function (url) {
        // get current using key
        var key = location.href.match(/\/key\/.+/);
        if (key != null) key = key[0];
        else key = '';
        return url + key;
    },
    json: function (string) {
        return JSON.parse(string);
    },
    keyrequest: function (method, url, content) {
        var xhr = new XMLHttpRequest();

        // send check request
        xhr.open(method, this.url(url));
        xhr.setRequestHeader("Content-type", "application/json");
        return new Promise(done => {
            xhr.onload = function () {
                done(xhr.response);
            }
            xhr.send(JSON.stringify(content));
        });
    },
    request: function (method, url, content) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("Content-type", "application/json");
        return new Promise(done => {
            xhr.onload = function () {
                done(xhr.response);
            }
            xhr.send(JSON.stringify(content));
        });
    }
}

export default dog;