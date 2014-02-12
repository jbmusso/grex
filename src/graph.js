var Pipeline = require('./pipeline');
var Vertex = require('./elements/vertex');
var Edge = require('./elements/edge');

module.exports = (function() {
  function Graph(gremlin) {
    this.gremlin = gremlin;
  }

  Graph.prototype.E = function() {
    this.gremlin.queryMain('E', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.V = function() {
    this.gremlin.queryMain('V', arguments);

    return new Pipeline(this.gremlin);
  };

  // Methods
  Graph.prototype.e = function() {
    this.gremlin.queryMain('e', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.idx = function() {
    this.gremlin.queryMain('idx', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.v = function() {
    this.gremlin.queryMain('v', arguments);

    return new Pipeline(this.gremlin);
  };

  // Indexing
  Graph.prototype.createIndex = function() {
    this.gremlin.queryMain('createIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.createKeyIndex = function() {
    this.gremlin.queryMain('createKeyIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndices = function() {
    this.gremlin.queryMain('getIndices', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndexedKeys = function() {
    this.gremlin.queryMain('getIndexedKeys', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndex = function() {
    this.gremlin.queryMain('getIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.dropIndex = function() {
    this.gremlin.queryMain('dropIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.dropKeyIndex = function() {
    this.gremlin.queryMain('dropKeyIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  // Types
  Graph.prototype.makeKey = function() {
    this.gremlin.queryMain('makeKey', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.clear = function() {
    this.gremlin.queryMain('clear', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.shutdown = function() {
    this.gremlin.queryMain('shutdown', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getFeatures = function() {
    this.gremlin.queryMain('getFeatures', arguments);

    return new Pipeline(this.gremlin);
  };

  // Titan specifics
  Graph.prototype.getTypes = function() {
    this.gremlin.queryMain('getTypes', arguments);

    return new Pipeline(this.gremlin);
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
  Graph.prototype.addVertex = function(properties, identifier) {
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

  Graph.prototype.addEdge = function() {
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

  Graph.prototype.stringifyArgument = function(argument) {
    return JSON.stringify(argument).replace('{', '[').replace('}', ']');
  };

  return Graph;
})();
