var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');
var Edge = require('../../edge');

module.exports = (function() {
  function AddEdgeMethod() {
    GremlinMethod.call(this, 'addEdge', arguments[0]);
  }

  inherits(AddEdgeMethod, GremlinMethod);

  AddEdgeMethod.prototype.run = function(gremlin, identifier) {
    this.edge = new Edge(gremlin);
    this.edge.identifier = identifier; // Non-enumerable property



    if (this.arguments.raw.properties._id) {
      this.edge._id = this.arguments.raw.properties._id;
    }

    this.edge._outV = this.arguments.raw.v1;
    this.edge._inV = this.arguments.raw.v2;
    this.edge._label = this.arguments.raw.label;

    var properties = this.arguments.raw.properties;

    _.each(properties, function(value, key) {
      this.edge[key] = value;
    }, this);

    delete this.arguments.raw._id;

    return this.edge;
  };

  AddEdgeMethod.prototype.toGroovy = function() {
    var identifierPrefix = this.edge.identifier ? this.edge.identifier + ' = ' : '';
    var id = this.edge._id ? this.edge._id + ',' : '';
    var str = identifierPrefix + 'g.addEdge('+ id + this.edge._outV.identifier +','+ this.edge._inV.identifier +',"'+ this.edge._label +'",'+ this.arguments.stringifyArgument(this.arguments.raw.properties) +')';

    return str;
  };

  return AddEdgeMethod;
})();