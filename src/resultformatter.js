/*jslint node: true */
'use strict';
var _ = require("lodash");


module.exports = (function() {
  function ResultFormatter() {
  }

  /**
   * @param {Array} results
   */
  ResultFormatter.prototype.formatResults = function(results) {
    var formattedResult = {
      results: [],
      typeMap: {}
    };

    _.each(results, function(resultItem) {
      if (_.isObject(resultItem)) {
        this.formatGraphElement(resultItem, formattedResult);
      } else {
        formattedResult.results.push(resultItem);
      }
    }, this);

    return formattedResult;
  };

  /**
   * Populate a gRex result object with given graph element. Rexster returns
   * a graph element property as an object whose properties each states their
   * respective type and value.
   *
   * For example, a vertex element with an 'age' property with value '29'
   * will be retrieved as the following JavaScript object (_id property
   * ommitted for brevity):
   *
   * {
   *   _type: 'vertex',
   *   age: {
   *     type: 'integer',
   *     value: '29'
   *   }
   * }
   *
   * This method will convert this raw vertex object into:
   *
   * {
   *   _type: 'vertex',
   *   age: 29
   * }
   *
   * @param {Object} graphElement A raw graph element as returned by Rexster
   * @param {Object} formattedResult gRex result object to populate
   */
  ResultFormatter.prototype.formatGraphElement = function(graphElement, formattedResult) {
    var returnObject = {};
    var typeObject = {};

    _.forOwn(graphElement, function(v, k) {
      if (_.isObject(v) && 'type' in v) {
        if(!!formattedResult.typeMap[k] && formattedResult.typeMap[k] != v.type){
          // An error occured
          if(!formattedResult.typeMapErr){
              formattedResult.typeMapErr = {};
          }

          console.error('_id:' + graphElement._id + ' => {' + k + ':' + v.type + '}');

          //only capture the first error
          if(!(k in formattedResult.typeMapErr)){
              formattedResult.typeMapErr[k] = formattedResult.typeMap[k] + ' <=> ' + v.type;
          }
        }

        if (v.type == 'map' || v.type == 'list') {
          //build recursive func to build object
          typeObject = this.createTypeDefinition(v.value);
          formattedResult.typeMap[k] = typeObject.typeDef;
          returnObject[k] = typeObject.result;
        } else {
          formattedResult.typeMap[k] = v.type;
          returnObject[k] = v.value;
        }
      } else {
        returnObject[k] = v;
      }
    }, this);

    formattedResult.results.push(returnObject);
  };

  ResultFormatter.prototype.createTypeDefinition = function(obj) {
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
          tempObject = this.createTypeDefinition(property.value);
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
      }, this);

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
          tempObject = this.createTypeDefinition(property.value);
          tempTypeObj[k] = tempObject.typeDefinition;
          tempResultObj[k] = tempObject.result;
        } else {
          tempTypeObj[k] = property.type;
          tempResultObj[k] = property.value;
        }
      }, this);

      returnObj.typeDefinition = tempTypeObj;
      returnObj.result = tempResultObj;
    }

    return returnObj;
  };

  return ResultFormatter;
})();
