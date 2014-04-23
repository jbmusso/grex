var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ObjectArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ObjectArgument, Argument);

  ObjectArgument.prototype.toGroovy = function() {
    return JSON.stringify(this.value).replace('{', '[').replace('}', ']');
  };

  ObjectArgument.prototype.updateList = function() {
    this.func.parenthesizedArguments.push(this.toGroovy());
  };

  return ObjectArgument;
})();