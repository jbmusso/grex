/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../method');

module.exports = (function() {
  function AddEdgeMethod(edge, properties) {
    this.edge = edge;
    GremlinMethod.call(this, 'addEdge', properties);
  }

  inherits(AddEdgeMethod, GremlinMethod);

  AddEdgeMethod.prototype.run = function(object) {
    if (this.arguments.properties && this.arguments.properties._id) {
      this.edge._id = this.arguments.properties._id;
    }

    this.edge._outV = this.arguments.v1;
    this.edge._inV = this.arguments.v2;
    this.edge._label = this.arguments.label;

    var properties = this.arguments.properties;

    _.each(properties, function(value, key) {
      this.edge[key] = value;
    }, this);

    delete this.arguments._id;

    return this.edge;
  };

  AddEdgeMethod.prototype.groovifyArguments = function() {
    var id = this.edge._id ? this.edge._id + ',' : '';

    var properties = this.arguments.properties;
    var propArgument = !_.isEmpty(properties) ? ','+ this.stringifyArgument(this.arguments.properties) : '';

    var _outV = this.edge._outV.identifier || this.arguments.v1;
    var _inV = this.edge._inV.identifier || this.arguments.v2;

    return '('+ id + _outV +','+ _inV +',"'+ this.edge._label +'"'+ propArgument + ')';
  };

  return AddEdgeMethod;
})();