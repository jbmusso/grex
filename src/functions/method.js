/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var GremlinFunction = require('./function');

module.exports = (function() {
  function GremlinMethod() {
    GremlinFunction.apply(this, arguments);
  }

  inherits(GremlinMethod, GremlinFunction);

  GremlinMethod.prototype.toGroovy = function() {
    return '.' + this.name + this.groovifyArguments();
  };

  return GremlinMethod;
})();