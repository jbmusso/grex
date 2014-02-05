var _ = require('lodash');

/*
* Abstract Element class
*/
module.exports = (function() {
  // Graph Elements are currently Vertex or Edge
  function Element() {
    this._id = null;
  }

  // Keep track of a temporary transaction id for each element
  Object.defineProperty(Element.prototype, "txid", {
    value: 0,
    enumerable: false,
    writable: true
  });

  Element.prototype.getProperties = function() {
    var o = {};

    _.each(this, function(property, propertyName) {
      o[propertyName] = this[propertyName];
    }, this);

    return o;
  };

  Element.prototype.setProperty = function (k, v) {
    this[k] = v;
    return this;
  };

  Element.prototype.setProperties = function (properties) {
    for (var key in properties) {
      this.setProperty(key, properties[key]);
    }
    return this;
  };

  /**
   * Titan specific method
   *
   * Use this instead of setProperty() when setting the value of an indexed
   * property.
   */
  Element.prototype.addProperty = function(k, v) {
    this[k] = v;
    return this;
  };

  /**
   * Titan specific method
   *
   * Use this instead of setProperties() when setting the values of indexed
   * properties.
   */
  Element.prototype.addProperties = function (properties) {
    for (var key in properties) {
      this.addProperty(key, properties[key]);
    }
    return this;
  };

  return Element;

})();
