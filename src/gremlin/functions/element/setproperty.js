var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function SetPropertyMethod() {
    GremlinMethod.call(this, 'setProperty', arguments[0]);
  }

  inherits(SetPropertyMethod, GremlinMethod);

  SetPropertyMethod.prototype.run = function(element) {
    var key = this.args.rawArgs.key;
    var value = this.args.rawArgs.value;

    element[key] = value;

    return element;
  };

  SetPropertyMethod.prototype.toGroovy = function() {
    var key = this.args.rawArgs.key;
    var value = this.args.rawArgs.value;

    return ".setProperty('" + key + "','" + value + "')";
  };

  return SetPropertyMethod;
})();