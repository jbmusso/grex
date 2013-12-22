## TODO (upcoming releases)
- Option to not use Transaction to do CUD (ie No need for commit()). eg. g.addVertex().then(); Batch kibble will not be required for these calls

## 0.4.0
- Nodeify callbacks

## 0.3.2
- Fixed Gruntfile and dev dependencies

## 0.3.1
- Add support for addProperty and setProperty for Vertex and Edge

## 0.3.0
- Expose gRex as global for browser version.
- Enable to be used with RequireJS.

## 0.2.5
- Structural changes
- Add Contributors to package.json

## 0.2.4
- Allow _() to be chained.

## 0.2.3
- Fixed bug that was dropping comma in typeDef's on subsequent posts
- Cater for embedded objects in lists

## 0.2.2
- Expose Tokens object
- Expose Contains object
- Expose Vertex object
- Expose Edge object

## 0.2.1
- Fixed bug on createVertex transaction
- added T.in and T.notin
 
## 0.2.0

 - get() call removed
 - rollback() removed
 - Enable multiple connections (multiple users) in Node module
 - New Transaction process for CUD. Must create transaction object and invoke cud methods. Includes better error trapping.
 - Transaction success no longer requires testing for success = true || false. Only successful values are returned to success callback. All errors sent to error callback.
 - Removed version and querytime from returned results
 - Complies with Blueprints 2.4.0
 - Add Contains.IN and Contains.NOT_IN
 - Data Type preservation

## 0.1.10

 - Removed the need to call get(), as it was a redundant call
 - Enalbled Vertex and Edge creation using Database generated Id's
 - Added methods linkIn, linkOut and linkBoth

