var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ClosureArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ClosureArgument, Argument);

  ClosureArgument.prototype.toGroovy = function() {
    return this.raw;
  };

  ClosureArgument.prototype.updateList = function(argumentList) {
    argumentList.closures.push(this.toGroovy());
  };

  return ClosureArgument;
})();