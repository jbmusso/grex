/*jslint node: true */
'use strict';
var inherits = require("inherits");

var ElementWrapper = require("./element");

module.exports = (function () {
  function VertexWrapper() {
    ElementWrapper.apply(this, arguments);

    this.properties._type = "vertex";
  }

  inherits(VertexWrapper, ElementWrapper);

  VertexWrapper.toGroovy = function() {
    return 'Vertex.class';
  };

  Object.defineProperty(VertexWrapper, 'class', {
    get: function() {
      return this.toGroovy();
    }
  });

  return VertexWrapper;

})();
