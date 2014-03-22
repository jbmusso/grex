var _ = require("lodash");

var Argument = require('./arguments/argument');
var ClosureArgument = require('./arguments/closure');
var ObjectArgument = require('./arguments/object');

module.exports = (function () {
  function ArgumentHandler(options) {
    this.options = options;
  }

  ArgumentHandler.prototype.buildString = function(args, retainArray) {
    var argList = [];
    var append = [];

    _.each(args, function(arg) {
      if (this.isClosure(arg)) {
        arg = new ClosureArgument(arg);
        append.push(arg.toString());
      } else if(retainArray && _.isArray(arg)) {
        arg = new Argument(arg, this.options);
        argList.push("[" + arg.parse() + "]");
      } else if (_.isObject(arg)) {
        arg = new ObjectArgument(arg);
        argList.push(arg.toString());
      } else {
        arg = new Argument(arg, this.options);
        argList.push(arg.parse());
      }
    }, this);

    return '(' + argList.join(',') + ')' + append.join(',');
  };

  ArgumentHandler.prototype.handleArray = function(args) {
    var argumentList = [];

    _.each(args, function(arg) {
      argumentList.push("[" + this.parse(arg) + "]");
    }, this);

    return '(' + argumentList.join(',') + ')';
  };

  ArgumentHandler.prototype.isClosure = function(val) {
    var closureRegex = /^\{.*\}$/;

    return _.isString(val) && closureRegex.test(val);
  };

  return ArgumentHandler;

})();
