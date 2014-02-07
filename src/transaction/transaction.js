var request = require('request');
var _ = require('lodash');

var Vertex = require('../elements/vertex');
var Edge = require('../elements/edge');

var Gremlin = require("../gremlin");

module.exports = (function () {
  function Transaction(gRex, typeMap) {
    this.options = gRex.options;
    this.typeMap = typeMap;

    this.gRex = gRex;
    this.gremlin = new Gremlin(gRex.argumentHandler);
    this.vertex = 0;
    this.edge = 0;
  }

  Transaction.prototype.commit = function(callback) {
    this.gremlin.computeTransactionScript();
    console.log(this.gremlin.script);
    return this.gRex.exec(this.gremlin.script).nodeify(callback);
  };

  Transaction.prototype.stringifyArgument = function(argument) {
    return JSON.stringify(argument).replace('{', '[').replace('}', ']');
  };

  /**
   * Build a Gremlin line used for adding a Vertex in the graph.
   * Note: for databases which accept custom _id properties (ie. non generated)
   * the user must pass a valid _id value in the properties map.
   * This slight change to the API of addVertex makes it easier to use
   * in a JavaScript environment.
   *
   * @param {Object} properties
   * @param {String} identifier Optional variable name used within the script context
   */
  Transaction.prototype.addVertex = function(properties, identifier) {
    var vertex = new Vertex(this.gremlin),
        id = properties._id ? properties._id +',' : '',
        identifierPrefix = identifier ? identifier + ' = ' : '',
        gremlinLine;

    vertex.identifier = identifier; // Non-enumerable property
    vertex.setProperties(properties);

    gremlinLine = identifierPrefix +'g.addVertex('+ id + this.stringifyArgument(properties) +')';
    this.gremlin.addLine(gremlinLine);

    return vertex;
  };

  Transaction.prototype.addEdge = function() {
    var edge = new Edge(this.gremlin);

    var argOffset = 0,
        properties;

    // edge.identifier = identifier;

    if (arguments.length === 5) {
      // Called g.addEdge(id, _outV, _inV, label, properties)
      argOffset = 1;
      edge._id = arguments[0];
    } // else g.addEdge(_outV, _inV, label, properties) was called, leave _id to null (default factory value).

    properties = arguments[3 + argOffset];

    edge._outV = arguments[0 + argOffset];
    edge._inV = arguments[1 + argOffset];
    edge._label = arguments[2 + argOffset];
    edge.setProperties(properties);

    gremlinLine = 'g.addEdge('+ edge._outV.identifier +','+edge._inV.identifier+',"'+ edge._label +'",'+ this.stringifyArgument(properties) +')';
    this.gremlin.addLine(gremlinLine);


    return edge;
  };

  return Transaction;
})();
