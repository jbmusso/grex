function createTypeDefinition(obj) {
  var tempObj = {},
    tempTypeObj = {},
    tempResultObj = {},
    tempTypeArr = [],
    tempResultArr = [],
    tempTypeArrLen = 0,
    len = 0,
    rest = 1,
    mergedObject = {},
    returnObj = {typeDef:{}, result: {}};

  if (_.isArray(obj)) {
    len = obj.length;

    for (var i = 0; i < len; i++) {
      if (obj[i].type == 'map' || obj[i].type == 'list') {
        tempObj = createTypeDefinition(obj[i].value);
        tempTypeArr[i] = tempObj.typeDef;
        tempResultArr[i] = tempObj.result;
      } else {
        tempTypeArr.push(obj[i].type);
        tempResultArr.push(obj[i].value);
      }

      if(i > 0) {
        //If type is map or list need to do deep compare
        //to ascertain whether equal or not
        //determine if the array has same types
        //then only show the type upto that index
        if (obj[i].type !== obj[i - 1].type) {
            rest = i + 1;
        }
      }
    }

    if(rest > 1 && _.isObject(tempTypeArr[rest])){
      //merge remaining objects
      tempTypeArrLen = tempTypeArr.length;
      mergedObject = tempTypeArr[rest - 1];

      for(var j = rest;j < tempTypeArrLen; j++){
        mergedObject = merge(mergedObject, tempTypeArr[j]);
      }

      tempResultArr[rest - 1] = mergedObject;
    }

    tempTypeArr.length = rest;
    returnObj.typeDef = tempTypeArr;
    returnObj.result = tempResultArr;
  } else {
    _.forOwn(obj, function(v, k) {
      if (v.type == 'map' || v.type == 'list'){
        tempObj = createTypeDefinition(v.value);
        tempTypeObj[k] = tempObj.typeDef;
        tempResultObj[k] = tempObj.result;
      } else {
        tempTypeObj[k] = v.type;
        tempResultObj[k] = v.value;
      }
    });

    returnObj.typeDef = tempTypeObj;
    returnObj.result = tempResultObj;
  }

  return returnObj;
}
