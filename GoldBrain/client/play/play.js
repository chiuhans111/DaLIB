import dog from '../web/dog';


var data = null;
function sync() {
    if (data != null) dog.keyrequest('post', '/api/member/update', data);
}