/*jslint node: true */
'use strict';
var inherits = require("inherits");

var ElementWrapper = require("./element");

module.exports = (function (){
  function EdgeWrapper() {
    ElementWrapper.apply(this, arguments);
    this.properties._type = "edge";
  }

  inherits(EdgeWrapper, ElementWrapper);

  EdgeWrapper.toGroovy = function() {
    return 'Edge.class';
  };

  Object.defineProperty(EdgeWrapper, 'class', {
    get: function() {
      return this.toGroovy();
    }
  });

  return EdgeWrapper;

})();
