/*jslint node: true */
'use strict';

module.exports = (function() {
  function ObjectWrapper(objectName) {
    this.objectName = objectName;
    this.methods = [];
    this.identifier = '';
    this.properties = {};
  }

  ObjectWrapper.prototype.toGroovy = function() {
    return this.objectName + this.methods.join('');
  };

  ObjectWrapper.prototype.asObject = function() {
    return this.properties;
  };

  return ObjectWrapper;
})();