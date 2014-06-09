/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');

module.exports = (function() {
  function GetPropertiesMethod() {
    GremlinMethod.call(this, 'getProperties', arguments[0]);
  }

  inherits(GetPropertiesMethod, GremlinMethod);

  GetPropertiesMethod.prototype.run = function(element) {
    var o = {};

    return element.properties;
  };

  return GetPropertiesMethod;
})();