var getType = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

exports.build = function (obj) {
    var type = getType(obj);
    var value = {};
    var desc = "";
    var varifiers = null;
    if (type == 'object')
        for (var i in obj.value) value[i] = exports.build(obj.value[i]);
    else if (type == 'array') return exports.or(obj.map(exports.build))
    return new exports.field(desc, value, ...varifiers);
}

exports.or = function (fields) {
    var me = {
        fields,
        varify,
        doc
    }

    function doc() { return me.fields.map(x => x.doc()); }
    function varify(obj) {
        for (var field of me.fields) if (field.varify(obj)) return true;
        else return { error: 'does not match any of these', doc: me.doc() }
    }

    return me;
}

exports.optional = function (field) {
    var me = {
        field,
        varify,
        doc
    }
    function varify(obj) {
        if (obj == null) return true;
        return me.field.varify(obj);
    }
    function doc() {
        var output = me.field.doc();
        output.optional = true;
        return output;
    }
    return me;
}

exports.field = function (desc, value, ...varifiers) {
    var me = {
        type: getType(value),
        varify,
        doc,
        desc,
    }

    if (me.type == 'string') me.type = value;
    else me.value = value;

    function error(message) {
        return { error: message, doc: me.doc() };
    }

    me.varifier = function (obj) {
        if (varifier instanceof Array)
            for (var varifier of varifiers) {
                if (varifier instanceof Function) {
                    var result = true;
                    result = varifier(obj);
                    if (result != true) return error(result);
                }
                if (me.type == 'string' && varifier instanceof RegExp) {
                    var match = str.match(varifier);
                    if (match != null) return true;
                    return error("input doesn't match requirement");
                }
            }
        return true;
    }

    this.desc = desc;

    function varify(obj) {
        if (obj == null) return error('missing');
        if (getType(obj) != me.type) return error('type mismatch');

        var varifylocal = me.varifier(obj);
        if (varifylocal != true) return varifylocal;

        var output = {};
        var pass = true;

        if (me.value != null) {
            if (me.type == 'object')
                for (var i in value) {
                    var result = me.value[i].varify(obj[i]);
                    if (result != true) { output[i] = result; pass = false; }
                }
            else if (me.type == 'array')
                for (var i in obj) {
                    var result = me.value[0].varify(obj[i]);
                    if (result != true) { output[i] = result; pass = false; }
                }
        }
        if (!pass) return output;
        return true;
    }

    function doc() {

        if ((me.type == 'object' || me.type == 'array') && me.value != null) {
            var output = [];
            for (var i in me.value) {
                output.push({
                    name: i,
                    value: me.value[i].doc()
                });
            }
            return { type: me.type, desc: me.desc, fields: output };
        } else return { type: me.type, desc: me.desc };

    }
    return me;
}

exports.mask = function (obj) {
    return function (target) {
        if (target == null) return null;
        var objType = getType(obj);
        var tarType = getType(target);
        if (obj === true) return target;

        if (objType != tarType) return null;
        if (objType == 'object') {
            var result = {};
            for (var i in obj) result[i] = exports.mask(obj[i])(target[i])
            return result;
        } else if (objType == 'array') {
            var mask = exports.mask(obj[0]);
            return target.map(mask);
        }
        return null;
    }
}

exports.post = function (app, path, field, callback) {
    app.get(path, (req, res) => {
        res.send(field.doc());
    })
    app.post(path, (req, res, next) => {
        var varify = field.varify(req.body);
        if (varify != true) res.status(406).send(varify);
        else callback(req, res, next);
    })
}