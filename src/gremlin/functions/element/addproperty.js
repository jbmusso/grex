var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddPropertyMethod() {
    GremlinMethod.call(this, 'addProperty', arguments[0]);
  }

  inherits(AddPropertyMethod, GremlinMethod);

  AddPropertyMethod.prototype.run = function(element) {
    var key = this.args.rawArgs.key;
    var value = this.args.rawArgs.value;

    element[key] = value;

    return element;
  };

  AddPropertyMethod.prototype.toGroovy = function() {
    var key = this.args.rawArgs.key;
    var value = this.args.rawArgs.value;

    return ".addProperty('" + key + "','" + value + "')";
  };

  return AddPropertyMethod;
})();