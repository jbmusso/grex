/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddPropertyMethod() {
    GremlinMethod.call(this, 'addProperty', arguments[0]);
  }

  inherits(AddPropertyMethod, GremlinMethod);

  AddPropertyMethod.prototype.run = function(element) {
    var key = this.arguments.key;
    var value = this.arguments.value;

    element[key] = value;

    return element;
  };

  AddPropertyMethod.prototype.toGroovy = function() {
    var key = this.arguments.key;
    var value = this.arguments.value;

    return ".addProperty('" + key + "','" + value + "')";
  };

  return AddPropertyMethod;
})();