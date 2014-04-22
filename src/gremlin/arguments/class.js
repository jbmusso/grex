var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ClassArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ClassArgument, Argument);

  ClassArgument.prototype.toGroovy = function() {
    return this.raw.toGroovy();
  };

  ClassArgument.prototype.updateList = function(argumentList) {
    argumentList.parenthesizedArguments.push(this.toGroovy());
  };

  return ClassArgument;
})();