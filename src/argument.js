var _ = require("lodash");

var Utils = require("./utils");
var isClosure = Utils.isClosure;
var isGraphReference = Utils.isGraphReference;
var isRegexId = Utils.isRegexId;


module.exports = (function () {
  function Argument() {
  }

  Argument.build = function(array, retainArray) {
    var argList = '',
        append = '',
        jsonString = '';

    _.each(array, function(v) {
      if(isClosure(v)){
        append += v;
      } else if (_.isObject(v) && v.hasOwnProperty('verbatim')) {
        argList += v.verbatim + ",";
      } else if (_.isObject(v) && !(v.hasOwnProperty('params') && isGraphReference(v.script))) {
        jsonString = JSON.stringify(v);
        jsonString = jsonString.replace('{', '[');
        argList += jsonString.replace('}', ']') + ",";
      } else if(retainArray && _.isArray(v)) {
        argList += "[" + Argument.parse.call(this, v) + "],";
      } else {
        argList += Argument.parse.call(this, v) + ",";
      }
    }, this);

    argList = argList.slice(0, -1);

    return '(' + argList + ')' + append;
  };


  Argument.parse = function(val) {
    if(val === null) {
      return 'null';
    }

    //check to see if the arg is referencing the graph ie. g.v(1)
    if(_.isObject(val) && val.hasOwnProperty('params') && isGraphReference(val.script)){
      return val.script.toString();
    }

    if(isGraphReference(val)) {
      return val.toString();
    }

    //Cater for ids that are not numbers but pass parseFloat test
    if(isRegexId.call(this, val) || _.isNaN(parseFloat(val))) {
      return "'" + val + "'";
    }

    if(!_.isNaN(parseFloat(val))) {
       return val.toString();
    }

    return val;
  };


  return Argument;

})();
