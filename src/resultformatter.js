var _ = require("lodash");

var createTypeDefinition = require("./createtypedefinition");


module.exports = (function() {
  function ResultFormatter() {
  }

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
          typeObject = createTypeDefinition(v.value);
          formattedResult.typeMap[k] = typeObject.typeDef;
          returnObject[k] = typeObject.result;
        } else {
          formattedResult.typeMap[k] = v.type;
          returnObject[k] = v.value;
        }
      } else {
        returnObject[k] = v;
      }
    });

    formattedResult.results.push(returnObject);
  };

  return ResultFormatter;
})();
