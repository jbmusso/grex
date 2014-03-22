var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function () {
  function ObjectArgument() {
    Argument.apply(this, arguments);
  }

  ObjectArgument.prototype.toString = function() {
    return JSON.stringify(this.raw).replace('{', '[').replace('}', ']');
  };


  inherits(ObjectArgument, Argument);

  return ObjectArgument;
})();