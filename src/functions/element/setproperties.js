/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function SetPropertiesMethod() {
    GremlinMethod.call(this, 'setProperties', arguments[0]);
  }

  inherits(SetPropertiesMethod, GremlinMethod);

  SetPropertiesMethod.prototype.run = function(element) {
    var key;
    var args = this.arguments;

    for (key in args) {
      element[key] = args[key];
    }

    return element;
  };

  SetPropertiesMethod.prototype.toGroovy = function() {
    return '.setProperties('+ this.stringifyArgument(this.arguments) +')';
  };

  return SetPropertiesMethod;
})();