var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');

module.exports = (function() {
  function SetPropertiesMethod() {
    GremlinMethod.call(this, 'setProperties', arguments[0]);
  }

  inherits(SetPropertiesMethod, GremlinMethod);

  SetPropertiesMethod.prototype.run = function(element) {
    _.each(this.args.rawArgs, function(value, key) {
      element[key] = value;
    });

    return element;
  };

  SetPropertiesMethod.prototype.toGroovy = function() {
    return '.setProperties('+ this.args.stringifyArgument(this.args.rawArgs) +')';
  };

  return SetPropertiesMethod;
})();