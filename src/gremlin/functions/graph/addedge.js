var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinMethod = require('../function');
var Edge = require('../../objects/edge');

module.exports = (function() {
  function AddEdgeMethod() {
    GremlinMethod.call(this, 'addEdge', arguments[0]);
  }

  inherits(AddEdgeMethod, GremlinMethod);

  AddEdgeMethod.prototype.run = function(gremlin, identifier) {
    this.edge = new Edge(gremlin);
    this.edge.identifier = identifier; // Non-enumerable property

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
    var identifierPrefix = this.edge.identifier ? this.edge.identifier + ' = ' : '';
    var id = this.edge._id ? this.edge._id + ',' : '';
    var str = identifierPrefix + 'g.addEdge('+ id + this.edge._outV.identifier +','+ this.edge._inV.identifier +',"'+ this.edge._label +'",'+ this.stringifyArgument(this.arguments.properties) +')';

    return str;
  };

  return AddEdgeMethod;
})();