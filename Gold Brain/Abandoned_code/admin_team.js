import dog from "../web/dog.js";

var data = {
    loading: true,
    teams: [],
    add: function () { },
    del: function () { },
    error: false,
};


dog.keyrequest('get', '/api/isadmin').then(dog.json).then(r => {
    if (r) return true;
    console.log('please login');
    data.error = "未授權的存取，您是否忘記登入？";
    throw "未授權的存取";
}).then(function () {
    console.log('HI admin~');
    function update(info) {
        data.loading = false;
        
        console.log(data.loading);
        dog.keyrequest('get', '/api/team').then(dog.json).then(r => {
            console.log(r);

            r.map(team => {
                team.active = false;
            })
            data.teams = r;

            // teams function
            data.add = function (count = 1) {
                data.loading = true;
                dog.keyrequest('post', '/api/addteam', {
                    count
                }).then(update);
            }
            data.del = function (ids) {
                data.loading = true;
                dog.keyrequest('post', '/api/delteam', {
                    ids
                }).then(update);
            }

            // team function
            data.teams.map(team => {

                team.set = function () {
                    data.loading = true;
                    dog.keyrequest('post', '/api/setteam', {
                        id: team._id,
                        value: {
                            name: team.name
                        }
                    }).then(update);
                }
            });


        })
    }
    update();
})

export default data;