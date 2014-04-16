var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddPropertiesMethod() {
    GremlinMethod.call(this, 'addProperties', arguments[0]);
  }

  inherits(AddPropertiesMethod, GremlinMethod);

  AddPropertiesMethod.prototype.run = function(element) {
    _.each(this.args.rawArgs, function(value, key) {
      element[key] = value;
    });

    return element;
  };

  AddPropertiesMethod.prototype.toGroovy = function() {
    return '.addProperties('+ this.args.stringifyArgument(this.args.rawArgs) +')';
  };

  return AddPropertiesMethod;
})();