/*jslint node: true */
'use strict';
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

  return ClosureArgument;
})();