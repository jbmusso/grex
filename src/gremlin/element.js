var _ = require('lodash');

var GetPropertiesMethod = require('./functions/element/getproperties');
var SetPropertiesMethod = require('./functions/element/setproperties');
var AddPropertiesMethod = require('./functions/element/addproperties');
var SetPropertyMethod = require('./functions/element/setproperty');

/*
* Abstract Element class
*/
module.exports = (function() {
  // Graph Elements are currently Vertex or Edge
  function Element(gremlin, identifier) {
    this._id = null;
    this.identifier = identifier;

    Object.defineProperty(this, "gremlin", {
      value: gremlin,
      enumerable: false,
      writable: false
    });
  }

  // Keep track of a temporary transaction id for each element
  Object.defineProperty(Element.prototype, "identifier", {
    value: null,
    enumerable: false,
    writable: true
  });

  Element.prototype.getProperties = function() {
    var method = new GetPropertiesMethod();
    this.gremlin.line(this.identifier + method.toGroovy());

    return method.run(this);
  };

  Element.prototype.setProperty = function(key, value) {
    var method = new SetPropertyMethod({ key: key, value: value });
    this.gremlin.line(this.identifier + method.toGroovy());

    return method.run(this);
  };

  Element.prototype.setProperties = function(properties) {
    var method = new SetPropertiesMethod(properties);
    this.gremlin.line(this.identifier + method.toGroovy());

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
    this[key] = value;
    this.gremlin.line(this.identifier + ".addProperty('"+key+"','"+value+"')");

    return this;
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
    this.gremlin.line(this.identifier + method.toGroovy());

    return method.run(this);
  };

  Element.prototype.remove = function() {
    var line = this.identifier +'.remove()';
    this.gremlin.line(line);
  };

  return Element;

})();
