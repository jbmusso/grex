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
    return '(' + this.parenthesizedArguments.join(',') + ')' + this.appendedArguments.join(',');
  };

  ArgumentList.prototype.buildArguments = function(retainArray) {
    _.each(this.rawArgs, function(arg) {
      if (this.isClosure(arg)) {
        arg = new ClosureArgument(arg);
        this.appendedArguments.push(arg.toString());
      } else if(retainArray && _.isArray(arg)) {
        arg = new Argument(arg, this.options);
        this.parenthesizedArguments.push("[" + arg.parse() + "]");
      } else if (_.isObject(arg)) {
        arg = new ObjectArgument(arg);
        this.parenthesizedArguments.push(arg.toString());
      } else {
        arg = new Argument(arg, this.options);
        this.parenthesizedArguments.push(arg.parse());
      }
    }, this);
  };

  ArgumentList.prototype.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  return ArgumentList;
})();