member
======
main task:
* create contest
* edit contest content

### view
__`GET`__ /api/member/contest/view/key/_`member key`_
* __return__ `object` contest information

### update
__`post`__ /api/member/contest/update/key/_`member key`_
* __body__ `json` document
* __return__ `object` error


admin
=====
* can do anything to the database

### is admin
__`GET`__ /api/admin/isadmin/key/_`admin key`_

* __return__ `boolean` true if admin key pass

crud operations
---------------
### list of collections
__`GET`__ /api/admin/collections/key/_`admin key`_

### get collection
__`GET`__ /api/admin/collection/_`collection name`_/key/_`admin key`_

### find in collection
__`GET`__ /api/admin/find/_`collection name`_/_`ObjectId`_/key/_`admin key`_

### create document
__`POST`__ /api/admin/create/_`collection name`_/key/_`admin key`_
* __body__ `json` document

### update document
__`POST`__ /api/admin/update/_`collection name`_/_`ObjectId`_/key/_`admin key`_
* __body__ `json` document

### delete document
__`GET`__ /api/admin/delete/_`collection name`_/_`ObjectId`_/key/_`admin key`_

### drop collection
__`GET`__ /api/admin/drop/_`collection name`_/key/_`admin key`_
