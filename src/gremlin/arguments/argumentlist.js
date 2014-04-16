var _ = require('lodash');

var Argument = require('./argument');
var ClosureArgument = require('./closure');
var ObjectArgument = require('./object');
var ArrayArgument = require('./array');

module.exports = (function () {
  function ArgumentList(rawArgs) {
    this.arguments = [].slice.call(rawArgs || []);
    this.rawArgs = rawArgs;

    this.parenthesizedArguments = [];
    this.appendedArguments = [];
  }

  ArgumentList.prototype.toGroovy = function() {
    var appendedArguments = this.appendedArguments.join(',');

    return '(' + this.parenthesizedArguments.join(',') + ')' + appendedArguments;
  };

  ArgumentList.prototype.buildArguments = function(retainArray) {
    _.each(this.arguments, function(argument) {
      if (this.isClosure(argument)) {
        built = new ClosureArgument(argument);
      } else if (retainArray && _.isArray(argument)) {
        built = new ArrayArgument(argument);
      } else if (_.isObject(argument)) {
        built = new ObjectArgument(argument);
      } else {
        built = new Argument(argument);
      }

      built.updateList(this);
    }, this);
  };

  ArgumentList.prototype.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  ArgumentList.prototype.stringifyArgument = function(argument) {
    return JSON.stringify(argument).replace('{', '[').replace('}', ']');
  };

  return ArgumentList;
})();