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
    _.each(this.rawArgs, function(arg) {
      if (this.isClosure(arg)) {
        built = new ClosureArgument(arg, this);
      } else if (retainArray && _.isArray(arg)) {
        built = new ArrayArgument(arg, this);
      } else if (_.isObject(arg)) {
        built = new ObjectArgument(arg, this);
      } else {
        built = new Argument(arg, this);
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