var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ObjectArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ObjectArgument, Argument);

  ObjectArgument.prototype.toString = function() {
    return JSON.stringify(this.raw).replace('{', '[').replace('}', ']');
  };

  ObjectArgument.prototype.updateList = function(argumentList) {
    argumentList.parenthesizedArguments.push(this.toString());
  };

  return ObjectArgument;
})();