/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');

module.exports = (function() {
  function AddEdgeMethod(edge, properties) {
    this.edge = edge;
    GremlinMethod.call(this, 'addEdge', properties);
  }

  inherits(AddEdgeMethod, GremlinMethod);

  AddEdgeMethod.prototype.run = function(object) {
    if (this.arguments.properties._id) {
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

  AddEdgeMethod.prototype.toGroovy = function() {
    var id = this.edge._id ? this.edge._id + ',' : '';
    var str = '.addEdge('+ id + this.edge._outV.identifier +','+ this.edge._inV.identifier +',"'+ this.edge._label +'",'+ this.stringifyArgument(this.arguments.properties) +')';

    return str;
  };

  return AddEdgeMethod;
})();