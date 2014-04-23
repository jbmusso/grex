var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function SetPropertiesMethod() {
    GremlinMethod.call(this, 'setProperties', arguments[0]);
  }

  inherits(SetPropertiesMethod, GremlinMethod);

  SetPropertiesMethod.prototype.run = function(element) {
    var key;
    var args = this.arguments.rawArgs;

    for (key in args) {
      element[key] = args[key];
    }

    return element;
  };

  SetPropertiesMethod.prototype.toGroovy = function() {
    return '.setProperties('+ this.arguments.stringifyArgument(this.arguments.rawArgs) +')';
  };

  return SetPropertiesMethod;
})();