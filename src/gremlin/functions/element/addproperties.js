var inherits = require('util').inherits;

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddPropertiesMethod() {
    GremlinMethod.call(this, 'addProperties', arguments[0]);
  }

  inherits(AddPropertiesMethod, GremlinMethod);

  AddPropertiesMethod.prototype.run = function(element) {
    var key;
    var args = this.args.rawArgs;

    for (key in args) {
      element[key] = args[key];
    }

    return element;
  };

  AddPropertiesMethod.prototype.toGroovy = function() {
    return '.addProperties('+ this.args.stringifyArgument(this.args.rawArgs) +')';
  };

  return AddPropertiesMethod;
})();