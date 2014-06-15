/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require('lodash');

var ObjectWrapper = require('./objectwrapper');
var GetPropertiesMethod = require('../functions/element/getproperties');
var SetPropertiesMethod = require('../functions/element/setproperties');
var AddPropertiesMethod = require('../functions/element/addproperties');
var SetPropertyMethod = require('../functions/element/setproperty');
var AddPropertyMethod = require('../functions/element/addproperty');
var GremlinMethod = require('../functions/method');

/**
 * Abstract ElementWrapper class
 */
module.exports = (function() {
  function ElementWrapper() {
    ObjectWrapper.apply(this, arguments);
    this.properties._id = null;
  }

  inherits(ElementWrapper, ObjectWrapper);

  ElementWrapper.prototype.getProperties = function() {
    var method = new GetPropertiesMethod();
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  ElementWrapper.prototype.setProperty = function(key, value) {
    var method = new SetPropertyMethod({ key: key, value: value });
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  ElementWrapper.prototype.setProperties = function(properties) {
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
  ElementWrapper.prototype.addProperty = function(key, value) {
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
  ElementWrapper.prototype.addProperties = function(properties) {
    var method = new AddPropertiesMethod(properties);
    this.methods.push(method.toGroovy());

    return method.run(this);
  };

  ElementWrapper.prototype.remove = function() {
    var method = new GremlinMethod('remove', []);
    this.methods.push(method.toGroovy());

    return this;
  };

  return ElementWrapper;

})();
