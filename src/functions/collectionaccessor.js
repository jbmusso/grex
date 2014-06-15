/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var GremlinMethod = require('./method');

module.exports = (function() {
  function CollectionAccessor() {
    GremlinMethod.call(this, null, arguments[0]);
  }

  inherits(CollectionAccessor, GremlinMethod);

  CollectionAccessor.prototype.toGroovy = function() {
    var str = '['+ this.arguments[0].toString() + ']';

    return str;
  };

  return CollectionAccessor;
})();