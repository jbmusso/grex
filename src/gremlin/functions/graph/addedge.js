var inherits = require('util').inherits;

var _ = require('lodash');

var Edge = require('../../edge');
var GremlinMethod = require('../function');

module.exports = (function() {
  function AddEdgeMethod() {
    GremlinMethod.call(this, 'addEdge', arguments[0]);
  }

  inherits(AddEdgeMethod, GremlinMethod);

  AddEdgeMethod.prototype.run = function(gremlin, identifier) {
    this.edge = new Edge(gremlin);

    this.edge.identifier = identifier; // Non-enumerable property

    if (this.args.rawArgs.properties._id) {
      this.edge._id = this.args.rawArgs.properties._id;
    }

    this.edge._outV = this.args.rawArgs.v1;
    this.edge._inV = this.args.rawArgs.v2;
    this.edge._label = this.args.rawArgs.label;

    var properties = this.args.rawArgs.properties;

    _.each(properties, function(value, key) {
      this.edge[key] = value;
    }, this);

    delete this.args.rawArgs._id;

    return this.edge;
  };

  AddEdgeMethod.prototype.toGroovy = function() {
    var identifierPrefix = this.edge.identifier ? this.edge.identifier + ' = ' : '';
    var id = this.edge._id ? this.edge._id + ',' : '';

    var str = identifierPrefix + 'g.addEdge('+ id + this.edge._outV.identifier +','+ this.edge._inV.identifier +',"'+ this.edge._label +'",'+ this.edge.gremlin.stringifyArgument(this.args.rawArgs.properties) +')';

    return str;
  };

  return AddEdgeMethod;
})();