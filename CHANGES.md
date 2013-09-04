## TODO (upcoming releases)
- Option to not use Transaction to do CUD (ie No need for commit()). eg. g.addVertex().then(); Batch kibble will not required for these calls
- Client version initialised with var g = require('grex');
 
## 0.2.0

 - get() call removed
 - rollback() removed
 - Enable multiple connections (multiple users) in Node module
 - New Transaction process for CUD. Must create transaction object and invoke cud methods. Includes better error trapping.
 - Transaction success no longer requires testing for success = true || false. Only successful values are returned to success callback. All errors sent to error callback.
 - Removed version and querytime from returned results
 - Complies with Blueprints 2.4.0
 - Add Contains.IN and Contains.NOT_IN

## 0.1.10

 - Removed the need to call get(), as it was a redundant call
 - Enalbled Vertex and Edge creation using Database generated Id's
 - Added methods linkIn, linkOut and linkBoth

