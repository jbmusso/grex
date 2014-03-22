var _ = require('lodash');

var Argument = require('./argument');
var ClosureArgument = require('./closure');
var ObjectArgument = require('./object');


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
        built = new ClosureArgument(arg, this.options);
        built.updateList(this);
      } else if (retainArray && _.isArray(arg)) {
        built = new Argument(arg, this.options);
        this.parenthesizedArguments.push("[" + built.parse() + "]");
      } else if (_.isObject(arg)) {
        built = new ObjectArgument(arg);
        built.updateList(this);
      } else {
        built = new Argument(arg, this.options);
        built.updateList(this);
      }
    }, this);
  };

  ArgumentList.prototype.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  return ArgumentList;
})();