var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function () {
  function ArrayArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ArrayArgument, Argument);

  ArrayArgument.prototype.updateList = function() {
    this.func.parenthesizedArguments.push("[" + this.parse() + "]");
  };

  return ArrayArgument;
})();