/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var GremlinMethod = require('../method');

module.exports = (function() {
  function GremlinStep(name, args) {
    GremlinMethod.apply(this, arguments);
  }

  inherits(GremlinStep, GremlinMethod);

  return GremlinStep;
})();