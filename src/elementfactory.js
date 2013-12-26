var Vertex = require("./elements/vertex");
var Edge = require("./elements/edge");

module.exports = (function() {

  function ElementFactory() {

  }

  ElementFactory.build = function(elementType) {
    var elements = {
      vertex: Vertex,
      edge: Edge
    };

    elementType = elementType.toLowerCase();

    return new elements[elementType]();
  };

  return ElementFactory;

})();