var _ = require('lodash');

var Argument = require('./argument');
var ClosureArgument = require('./closure');
var ObjectArgument = require('./object');
var ArrayArgument = require('./array');

module.exports = (function () {
  function ArgumentList(rawArgs) {
    this.rawArgs = rawArgs;

    this.parenthesizedArguments = [];
    this.appendedArguments = [];
  }

  ArgumentList.prototype.toGroovy = function() {
    var appendedArguments = this.appendedArguments.join(',');

    return '(' + this.parenthesizedArguments.join(',') + ')' + appendedArguments;
  };

  ArgumentList.prototype.buildArguments = function(retainArray) {
    _.each(this.rawArgs, function(rawArg) {
      if (this.isClosure(rawArg)) {
        built = new ClosureArgument(rawArg);
      } else if (retainArray && _.isArray(rawArg)) {
        built = new ArrayArgument(rawArg);
      } else if (_.isObject(rawArg)) {
        built = new ObjectArgument(rawArg);
      } else {
        built = new Argument(rawArg);
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