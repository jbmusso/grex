var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function SetPropertyMethod() {
    GremlinMethod.call(this, 'setProperty', arguments[0]);
  }

  inherits(SetPropertyMethod, GremlinMethod);

  SetPropertyMethod.prototype.run = function(element) {
    var key = this.arguments.raw.key;
    var value = this.arguments.raw.value;

    element[key] = value;

    return element;
  };

  SetPropertyMethod.prototype.toGroovy = function() {
    var key = this.arguments.raw.key;
    var value = this.arguments.raw.value;

    return ".setProperty('" + key + "','" + value + "')";
  };

  return SetPropertyMethod;
})();