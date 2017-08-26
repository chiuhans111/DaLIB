import dog from "../web/dog.js";

var q = location.href.match(/\/q\/(\w+)\//);
q = q ? q[1] : 'team';

var data = {
    loading: true,
    items: [],
    collection: q,
    add: function () { },
    del: function () { },
    drop: function () { },
    reload: function () { },
    error: false,
    collections: [],
    go: function () { }
};
var statechange = false;
onpopstate = function ({ state }) {
    statechange = true;
    data.collection = state.collection;
    data.reload();
}

dog.keyrequest('get', '/api/admin/isadmin').then(dog.json).then(r => {
    if (r) return true;
    console.log('please login');
    data.error = "未授權的存取，您是否忘記登入？";
    throw "未授權的存取";
}).then(function () {
    console.log('HI admin~');

    function update(info) {
        if (!statechange)
            history.pushState({ collection: data.collection }, data.collection, dog.url('/admin.html?/q/' + data.collection));
        statechange = false;
        dog.keyrequest('get', '/api/admin/collections')
            .then(dog.json).then(r => data.collections = r.map(l => l.name));

        data.loading = true;
        console.log(data.info);
        dog.keyrequest('get', '/api/admin/collection/' + data.collection)
            .then(dog.json).then(r => {
                data.loading = false;
                console.log(r);
                r.map(item => {
                    var target = data.items.filter(x => x._id == item._id)[0];
                    if (target) item._active = target._active;
                    else item._active = false;
                })
                data.items = r;

                // teams function
                data.add = function (obj) {
                    data.loading = true;
                    dog.keyrequest('post', '/api/admin/create/' + data.collection,
                        obj
                    ).then(update);
                }
                data.del = function (ids) {
                    data.loading = true;
                    dog.keyrequest('post', '/api/admin/delete/' + data.collection, {
                        ids
                    }).then(update);
                }
                data.drop = function () {
                    dog.keyrequest('get', '/api/admin/drop/' + data.collection).then(update);
                }

                // team function
                data.items.map(item => {
                    item._set = function (obj) {
                        data.loading = true;
                        dog.keyrequest('post',
                            '/api/admin/update/' +
                            data.collection + '/' + item._id, obj).then(update);
                    }
                });


            })
    }
    data.reload = function () {
        return new Promise(done => {
            update();
        })
    };
    update();
})

export default data;