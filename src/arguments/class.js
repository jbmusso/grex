/*jslint node: true */
'use strict';
var inherits = require('inherits');
var Argument = require('./argument');

module.exports = (function() {
  function ClassArgument() {
    Argument.apply(this, arguments);
  }

  inherits(ClassArgument, Argument);

  ClassArgument.prototype.toGroovy = function() {
    return this.value.toGroovy();
  };

  return ClassArgument;
})();