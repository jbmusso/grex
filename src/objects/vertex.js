var inherits = require("inherits");

var Element = require("./element");

module.exports = (function (){
  function Vertex() {
    this._type = "vertex";

    Element.apply(this, arguments); // Call parent constructor
  }

  inherits(Vertex, Element);

  return Vertex;

})();
