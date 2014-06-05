/*jslint node: true */
'use strict';
var inherits = require("inherits");

var Element = require("./element");

module.exports = (function () {
  function Vertex() {
    this._type = "vertex";

    Element.apply(this, arguments);
  }

  inherits(Vertex, Element);

  Vertex.toGroovy = function() {
    return 'Vertex.class';
  };

  Object.defineProperty(Vertex, 'class', {
    get: function() {
      return this.toGroovy();
    }
  });

  return Vertex;

})();
