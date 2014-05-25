var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinObject = require('./object');
var GetPropertiesMethod = require('../functions/element/getproperties');
var SetPropertiesMethod = require('../functions/element/setproperties');
var AddPropertiesMethod = require('../functions/element/addproperties');
var SetPropertyMethod = require('../functions/element/setproperty');
var AddPropertyMethod = require('../functions/element/addproperty');

/**
 * Abstract Element class
 */
module.exports = (function() {
  function Element() {
    GremlinObject.apply(this, arguments);
    this._id = null;
  }

  inherits(Element, GremlinObject);

  // Keep track of a temporary object for each element
  Object.defineProperty(Element.prototype, "object", {
    value: null,
    enumerable: false,
    writable: true
  });

  Element.prototype.getProperties = function() {
    var method = new GetPropertiesMethod();
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  Element.prototype.setProperty = function(key, value) {
    var method = new SetPropertyMethod({ key: key, value: value });
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  Element.prototype.setProperties = function(properties) {
    var method = new SetPropertiesMethod(properties);
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  /**
   * Titan specific method
   *
   * Use this instead of setProperty() when setting the value of an indexed
   * property.
   *
   * @param {String} key
   * @param {Object} value
   */
  Element.prototype.addProperty = function(key, value) {
    var method = new AddPropertyMethod({ key: key, value: value });
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  /**
   * Titan specific method
   *
   * Use this instead of setProperties() when setting the values of indexed
   * properties.
   *
   * @param {Object} properties
   */
  Element.prototype.addProperties = function(properties) {
    var method = new AddPropertiesMethod(properties);
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  Element.prototype.remove = function() {
    var line = this.object +'.remove()';
    this.methods.push('remove()');
  };

  return Element;

})();
