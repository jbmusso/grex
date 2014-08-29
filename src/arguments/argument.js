/*jslint node: true */
'use strict';
var _ = require('lodash');

module.exports = (function () {
  function Argument(value, func) {
    this.value = value;
    this.func = func;
  }

  Argument.prototype.toGroovy = function() {
    return this.parse();
  };

  Argument.prototype.parse = function() {
    var argument = this.value;

    if (argument === null) {
      return 'null';
    }

    if (this.isClassReference()) {
      return argument.toString();
    }

    if (this.isFloat()) {
      return this.value;
    }

    // Handle ids that are not numbers but pass parseFloat test
    // (ie. Titan edge ids)
    if (_.isString(argument) && this.isFloat()) {
      return "'" + argument + "'";
    }

    if (_.isArray(argument)) {
      var parsedArray = _.map(argument, function(element) {
        if (_.isString(element)) {
          return "'" + element + "'";
        }

        return element;
      });

      return parsedArray.toString();
    }

    if (_.isBoolean(argument)) {
      return argument.toString();
    }

    return "'"+ argument +"'";
  };

  Argument.prototype.isFloat = function() {
    return !_.isNaN(parseFloat(this.value)) && this.value.slice(-1) === 'f';
    // return this.value.slice(-1) === 'f';
  };

  Argument.prototype.isClassReference = function() {
    var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt|decr|incr|notin|in)$|^Contains\.(IN|NOT_IN)$|^g\.|^Vertex(\.class)$|^Edge(\.class)$|^String(\.class)$|^Integer(\.class)$|^Geoshape(\.class)$|^Direction\.(OUT|IN|BOTH)$|^TitanKey(\.class)$|^TitanLabel(\.class)$/;

    return _.isString(this.value) && graphRegex.test(this.value);
  };

  return Argument;
})();
