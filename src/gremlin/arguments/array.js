var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function () {
  function ArrayArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ArrayArgument, Argument);

  ArrayArgument.prototype.updateList = function(argumentList) {
    argumentList.parenthesizedArguments.push("[" + this.parse() + "]");
  };

  return ArrayArgument;
})();