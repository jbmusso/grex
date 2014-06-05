/*jslint node: true */
'use strict';
var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function () {
  function ArrayArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ArrayArgument, Argument);

  ArrayArgument.prototype.toGroovy = function() {
    return "[" + this.parse() + "]";
  };

  return ArrayArgument;
})();