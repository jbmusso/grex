var inherits = require("inherits");

var Element = require("./element");

module.exports = (function (){
  function Edge() {
    this._type = "edge";

    Element.apply(this, arguments); // Call parent constructor
  }

  inherits(Edge, Element);

  return Edge;

})();
