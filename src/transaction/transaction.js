var request = require('request');
var _ = require('lodash');

var TransactionCommitter = require("./transactioncommitter");

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

  Transaction.prototype.addVertex = function(txid) {
    var vertex = new Vertex(this.gremlin);

    var properties,
        id,
        gremlinLine;


    vertex.txid = txid;

    if (_.isObject(arguments[1])) {
      // Called addVertex(txid, {..}) or updateVertex(txid, {..}), ie. user is expecting the graph database to autogenerate _id
      properties = arguments[1];
      vertex.setProperties(properties);

      gremlinLine = vertex.txid +' = g.addVertex('+ this.stringifyArgument(properties) +')';
      this.gremlin.addLine(gremlinLine);
    } else {
      // Called addVertex(txid, id) or updateVertex(txid, id) with no arguments
      vertex._id = arguments[1];

      // Called addVertex(txid, id, {..}) or updateVertex(txid, id, {..})
      if (arguments.length === 3) {
        id = arguments[1];
        properties = arguments[2];
        vertex.setProperties(properties);

        gremlinLine = vertex.txid +' = g.addVertex('+ id +','+ this.stringifyArgument(properties) +')';
        this.gremlin.addLine(gremlinLine);
      }
    }

    return vertex;
  };

  Transaction.prototype.addEdge = function() {
    var edge = new Edge(this.gremlin);

    var argOffset = 0,
        properties;

    // edge.txid = txid;

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

    gremlinLine = 'g.addEdge('+ edge._outV.txid +','+edge._inV.txid+',"'+ edge._label +'",'+ this.stringifyArgument(properties) +')';
    this.gremlin.addLine(gremlinLine);


    return edge;
  };

  return Transaction;
})();
