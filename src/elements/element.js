/*
* Abstract Element class
*/
module.exports = (function() {
  // Graph Elements are currently Vertex or Edge
  function Element() {
    this._id = null;
  }

  Element.prototype.getProperties = function() {
    var o = {};

    for (var propertyName in this) {
        if (this.hasOwnProperty(property)) {
            o[propertyName] = this[propertyName];
        }
    }

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
