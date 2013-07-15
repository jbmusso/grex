## 0.1.11

 - Enable multiple connections (multiple users) in Node module
 - New Transaction process for CUD. Must create transaction object and invoke cud methods.
 - Option not use Transaction to do CUD (ie No need for commit()). eg. g.addVertex().then(); Batch kibble not required
 - Client version initialised with var g = require('grex');
 - Removed version and querytime from returned results

## 0.1.10

 - Removed the need to call get(), as it was a redundant call
 - Enalbled Vertex and Edge creation using Database generated Id's
 - Added methods linkIn, linkOut and linkBoth

