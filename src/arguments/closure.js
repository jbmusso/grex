var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function () {
  function ClosureArgument() {
    Argument.apply(this, arguments);
  }

  Argument.prototype.toString = function() {
    return this.raw;
  };

  inherits(ClosureArgument, Argument);

  return ClosureArgument;
})();