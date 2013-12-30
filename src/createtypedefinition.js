var _ = require('lodash');

module.exports = function createTypeDefinition(obj) {
  var tempObject = {},
    tempTypeObj = {},
    tempResultObj = {},
    tempTypeArray = [],
    tempResultArr = [],
    tempTypeArrLen = 0,
    rest = 1,
    mergedObject = {},
    returnObj = {
      typeDefinition: {},
      result: {}
    };

  if (_.isArray(obj)) {

    _.each(obj, function(property, i) {
      if (property.type == 'map' || property.type == 'list') {
        tempObject = createTypeDefinition(property.value);
        tempTypeArray[i] = tempObject.typeDefinition;
        tempResultArr[i] = tempObject.result;
      } else {
        tempTypeArray.push(property.type);
        tempResultArr.push(property.value);
      }

      if (i > 0) {
        //If type is map or list need to do deep compare
        //to ascertain whether equal or not
        //determine if the array has same types
        //then only show the type upto that index
        if (property.type !== obj[i - 1].type) {
            rest = i + 1;
        }
      }
    });

    if(rest > 1 && _.isObject(tempTypeArray[rest])){
      //merge remaining objects
      tempTypeArrLen = tempTypeArray.length;
      mergedObject = tempTypeArray[rest - 1];

      for(var j = rest; j < tempTypeArrLen; j++){
        mergedObject = _.extend(mergedObject, tempTypeArray[j]);
      }

      tempResultArr[rest - 1] = mergedObject;
    }

    tempTypeArray.length = rest;
    returnObj.typeDefinition = tempTypeArray;
    returnObj.result = tempResultArr;
  } else {
    _.forOwn(obj, function(property, k) {
      if (property.type == 'map' || property.type == 'list') {
        tempObject = createTypeDefinition(property.value);
        tempTypeObj[k] = tempObject.typeDefinition;
        tempResultObj[k] = tempObject.result;
      } else {
        tempTypeObj[k] = property.type;
        tempResultObj[k] = property.value;
      }
    });

    returnObj.typeDefinition = tempTypeObj;
    returnObj.result = tempResultObj;
  }

  return returnObj;
};
