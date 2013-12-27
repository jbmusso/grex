var _ = require("lodash");

module.exports = (function () {
  function Argument() {
  }

  Argument.build = function(array, retainArray) {
    var argList = '',
        append = '',
        jsonString = '';

    _.each(array, function(v) {
      if(Argument.isClosure(v)){
        append += v;
      } else if (_.isObject(v) && v.hasOwnProperty('verbatim')) {
        argList += v.verbatim + ",";
      } else if (_.isObject(v) && !(v.hasOwnProperty('params') && Argument.isGraphReference(v.script))) {
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
    if(_.isObject(val) && val.hasOwnProperty('params') && Argument.isGraphReference(val.script)){
      return val.script.toString();
    }

    if(Argument.isGraphReference(val)) {
      return val.toString();
    }

    //Cater for ids that are not numbers but pass parseFloat test
    if(Argument.isRegexId.call(this, val) || _.isNaN(parseFloat(val))) {
      return "'" + val + "'";
    }

    if(!_.isNaN(parseFloat(val))) {
      return val.toString();
    }

    return val;
  };

  Argument.isRegexId = function(id) {
    return !!this.options.idRegex && _.isString(id) && this.options.idRegex.test(id);
  };

  Argument.isGraphReference = function(val) {
    var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt|decr|incr|notin|in)$|^Contains\.(IN|NOT_IN)$|^g\.|^Vertex(\.class)$|^Edge(\.class)$|^String(\.class)$|^Integer(\.class)$|^Geoshape(\.class)$|^Direction\.(OUT|IN|BOTH)$|^TitanKey(\.class)$|^TitanLabel(\.class)$/;

    return _.isString(val) && graphRegex.test(val);
  };

  Argument.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  return Argument;

})();
