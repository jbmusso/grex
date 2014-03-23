var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ClosureArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ClosureArgument, Argument);

  ClosureArgument.prototype.toString = function() {
    return this.raw;
  };

  ClosureArgument.prototype.updateList = function(argumentList) {
    argumentList.appendedArguments.push(this.toString());
  };

  return ClosureArgument;
})();