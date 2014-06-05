/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddVertexMethod(vertex, properties) {
    this.vertex = vertex;
    GremlinMethod.call(this, 'addVertex', properties);
  }

  inherits(AddVertexMethod, GremlinMethod);

  AddVertexMethod.prototype.run = function() {
    _.each(this.arguments, function(value, key) {
      this.vertex[key] = value;
    }, this);

    return this.vertex;
  };

  AddVertexMethod.prototype.toGroovy = function() {
    var id = this.vertex._id ? this.vertex._id +',' : '';

    var str = '.addVertex('+ id + this.stringifyArgument(this.arguments) +')';

    return str;
  };

  return AddVertexMethod;
})();