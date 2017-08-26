// ***** ***** ****  *****
//   *   *   * *   * *   *
//   *   *   * *   * *   *
//   *   *   * *   * *   *
//   *   ***** ****  *****  this is not finished




var getType = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1]
}

function modelfield(model, field) {
    var result = {};
    result[field] = model[field];
    if (model.value != undefined) {
        result.value = {};
        for (var i in model.value) result.value[i] = modelfield(model.value[i], field);
    }
    return result;
}

function modelonlyfield(model, field) {
    var result = {};
    if (model[field]) return model[field];
    else if (model.value != undefined) {
        for (var i in model.value) result[i] = modelonlyfield(model.value[i], field);
    }
    return result;
}

function valid(target, model) {
    if (target == undefined && !model.optional) return { error: "undefined" };

    var targetType = getType(target);
    if (!model.type.includes(targetType)) return { error: `${target} is not a [${model.type.join(' or ')}], found [${targetType}]` }

    var formated = target;
    if (model.funcs instanceof Array) {
        var x = model.funcs.map(func => {
            if (func.if instanceof Function) if (!func.if(formated, target)) return;
            if (func.foramt instanceof Function) formated = func.format(formated, target);
            if (func.valid instanceof Function) if (!func.valid(formated, target)) return
            func.text instanceof Function ? func.text(formated, target) : func.text;
        }).filter(x => x != null);
        if (x.length > 0) return { error: x.join() }
    }
    target = formated;

    if (model.value != undefined) {
        if (target instanceof Array) {
            var valids = [];
            var errors = {};
            var isvalid = true;
            target.map((item, i) => {
                if (!item instanceof Object) item = { value: item };
                var result = valid(item, model.value);
                if (result.error) {
                    errors[i] = result.error;
                    isvalid = false;
                } else if (result.valid) valids.push(result.valid)
            });
            if (isvalid) return { valid: valids };
            else return { error: errors, valid: valids };
        } else if (target instanceof Object) {
            var valids = {};
            var errors = {};
            var isvalid = true;
            for (var i in model.value) {
                var result = valid(target[i], model.value[i]);
                if (result.error) {
                    errors[i] = result.error;
                    isvalid = false;
                }
                if (result.valid) valids[i] = result.valid;
            }
            if (isvalid) return { valid: valids };
            else return { error: errors, valid: valids };
        }
    } else return { valid: formated };
}

exports.api = function (api) {
    var me = this;
    this.compiled = compile(api);
    this.valid = function (obj) {
        return valid(obj, me.compiled);
    }

    this.desc = function () {
        return modelfield(me.compiled, 'desc');
    }

    this.default = function () {
        return modelonlyfield(me.compiled, 'default');
    }

    this.post = function (app, path, callback) {
        app.get(path, (req, res) => {
            res.send(me.desc())
        });
        app.post(path, (req, res, next) => {
            var varify = me.valid(req.body);
            if (varify.error) res.status(400).send(varify.error);
            else {
                res.body = varify.valid;
                callback(req, res, next);
            }
        })
    }
}

exports.default = function (value) {
    return {
        mixin(result) {
            result.default = value;
        }
    }
}
exports.optional = {
    mixin: function (result) {
        this.optional = true;
    }
}
exports.valid = function (func, message) {
    return {
        mixin(result) {
            if (result.funcs == undefined) result.funcs = [];
            result.funcs.push({
                valid: func,
                text: message
            })
        }
    }
}
exports.format = function (func) {
    return {
        mixin(result) {
            if (result.funcs == undefined) result.funcs = [];
            result.funcs.push({
                foramt: func
            })
        }
    }
}
exports.formatIf = function (test, func) {
    return {
        mixin(result) {
            if (result.funcs == undefined) result.funcs = [];
            result.funcs.push({
                format: func,
                if: test
            })
        }
    }
}

function compile(obj) {

    if (obj == null) return null;
    // lazy, only provide a type
    if (obj instanceof Function) return { type: [obj.name] };
    // normal, provide an array of define
    if (obj instanceof Array) {
        // the default result
        var result = {
            type: [], desc: '', value: null, funcs: [],
        }
        obj.map(x => {
            // pre defined mixin funcions
            if (x.mixin instanceof Function) x.mixin(result);
            // other type of define
            else {
                switch (getType(x)) {
                    case 'Function': result.type.push(x.name); break;
                    case 'Object': result.value = compile(x); break;
                    case 'Array': result.value = { value: compile(x) }; break;
                    case 'String': result.desc += x; break;
                }
            }
        })
        return result;
    }
    // pass in an object
    if (obj instanceof Object) {
        var result = {};
        for (var i in obj) {
            // it a compiled object!
            if (getType(obj[i]) == 'Object') {
                obj[i].value = compile(obj[i].value);
                result[i] = obj[i];
            } else result[i] = compile(obj[i]);
        }
        return result;
    }
}
var api = exports;

exports.exampleAPI = {
    // basic and validator
    prop1: String,
    porp2: [String, 'this is a string'],
    prop3: [Number, 'here is a number, need to be greater then 5',
        api.valid(x => x > 5, "need to be greater then five")],
    // object define
    prop4: ['I am a object, have name and age!', {
        name: String,
        age: Number
    }],
    // complex define and formatter
    prop5: [Number, String, 'I am a number, but I accept string, if I can convert it',
        api.formatIf(x => x instanceof String, x => Number(x)),
        api.valid(x => x instanceof Number, "need to be a valid number"),
        api.valid(x => isFinite(x), "need to be finite"),
        api.valid(x => x < 50, "need to be smaller then 50")
    ],
    // misc
    prop6: ['I can be anything'],
    prop7: [api.optional, 'I am optional'],
    // compiled
    prop9: {
        type: [Object],
        desc: "here is a compiled prop",
        value: {
            subProp1: {
                type: [Number],
                default: 5
            }
        },
        funcs: [
            { valid: f => f > 50 },
            { if: f => f > 30, format: f => f - 1 }
        ]
    }
}
