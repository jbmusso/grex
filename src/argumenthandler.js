var _ = require("lodash");

module.exports = (function () {
  function ArgumentHandler(options) {
    this.options = options;
  }

  ArgumentHandler.prototype.build = function(args, retainArray) {
    var argList = '';
    var append = '';
    var jsonString = '';

    _.each(args, function(v) {
      if (this.isClosure(v)){
        append += v;
      } else if (_.isObject(v) && v.hasOwnProperty('verbatim')) {
        argList += v.verbatim + ",";
      } else if (_.isObject(v) && !(v.hasOwnProperty('params') && this.isGraphReference(v.script))) {
        jsonString = JSON.stringify(v);
        jsonString = jsonString.replace('{', '[');
        argList += jsonString.replace('}', ']') + ",";
      } else if(retainArray && _.isArray(v)) {
        argList += "[" + this.parse(v) + "],";
      } else {
        argList += this.parse(v) + ",";
      }
    }, this);

    argList = argList.slice(0, -1);

    return '(' + argList + ')' + append;
  };

  ArgumentHandler.prototype.parse = function(val) {
    if(val === null) {
      return 'null';
    }

    //check to see if the arg is referencing the graph ie. g.v(1)
    if(_.isObject(val) && val.hasOwnProperty('params') && this.isGraphReference(val.script)){
      return val.script.toString();
    }

    if(this.isGraphReference(val)) {
      return val.toString();
    }

    //Cater for ids that are not numbers but pass parseFloat test
    if(this.isRegexId(val) || _.isNaN(parseFloat(val))) {
      return "'" + val + "'";
    }

    if(!_.isNaN(parseFloat(val))) {
      return val.toString();
    }

    return val;
  };

  ArgumentHandler.prototype.isRegexId = function(id) {
    return !!this.options.idRegex && _.isString(id) && this.options.idRegex.test(id);
  };

  ArgumentHandler.prototype.isGraphReference = function(val) {
    var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt|decr|incr|notin|in)$|^Contains\.(IN|NOT_IN)$|^g\.|^Vertex(\.class)$|^Edge(\.class)$|^String(\.class)$|^Integer(\.class)$|^Geoshape(\.class)$|^Direction\.(OUT|IN|BOTH)$|^TitanKey(\.class)$|^TitanLabel(\.class)$/;

    return _.isString(val) && graphRegex.test(val);
  };

  ArgumentHandler.prototype.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  return ArgumentHandler;

})();
