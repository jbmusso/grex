/*jslint node: true */
'use strict';
var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function IntegerArgument() {
    Argument.apply(this, arguments);
  }

  inherits(IntegerArgument, Argument);

  IntegerArgument.prototype.toGroovy = function() {
    return this.value;
  };

  return IntegerArgument;
})();