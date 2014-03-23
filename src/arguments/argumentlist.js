var _ = require('lodash');

var Argument = require('./argument');
var ClosureArgument = require('./closure');
var ObjectArgument = require('./object');
var ArrayArgument = require('./array');

module.exports = (function () {
  function ArgumentList(rawArgs, options) {
    this.rawArgs = rawArgs;
    this.options = options;

    this.parenthesizedArguments = [];
    this.appendedArguments = [];
  }

  ArgumentList.prototype.toString = function() {
    var appendedArguments = this.appendedArguments.join(',');

    return '(' + this.parenthesizedArguments.join(',') + ')' + appendedArguments;
  };

  ArgumentList.prototype.buildArguments = function(retainArray) {
    _.each(this.rawArgs, function(rawArg) {
      if (this.isClosure(rawArg)) {
        built = new ClosureArgument(rawArg, this);
      } else if (retainArray && _.isArray(rawArg)) {
        built = new ArrayArgument(rawArg, this);
      } else if (_.isObject(rawArg)) {
        built = new ObjectArgument(rawArg, this);
      } else {
        built = new Argument(rawArg, this);
      }

      built.updateList(this);
    }, this);
  };

  ArgumentList.prototype.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  return ArgumentList;
})();