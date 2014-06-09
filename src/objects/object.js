/*jslint node: true */
'use strict';
module.exports = (function() {
  function GremlinObject(objectName) {
    this.objectName = objectName;
    this.methods = [];
    this.identifier = '';
  }

  GremlinObject.prototype.toGroovy = function() {
    return this.objectName + this.methods.join('');
  };

  return GremlinObject;
})();