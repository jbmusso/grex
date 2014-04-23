var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddPropertyMethod() {
    GremlinMethod.call(this, 'addProperty', arguments[0]);
  }

  inherits(AddPropertyMethod, GremlinMethod);

  AddPropertyMethod.prototype.run = function(element) {
    var key = this.arguments.raw.key;
    var value = this.arguments.raw.value;

    element[key] = value;

    return element;
  };

  AddPropertyMethod.prototype.toGroovy = function() {
    var key = this.arguments.raw.key;
    var value = this.arguments.raw.value;

    return ".addProperty('" + key + "','" + value + "')";
  };

  return AddPropertyMethod;
})();