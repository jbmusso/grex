var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ClosureArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ClosureArgument, Argument);

  ClosureArgument.prototype.toGroovy = function() {
    return this.value;
  };

  ClosureArgument.prototype.updateList = function() {
    this.func.closures.push(this.toGroovy());
  };

  return ClosureArgument;
})();