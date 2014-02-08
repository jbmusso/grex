var Pipeline = require('./pipeline');
var Vertex = require('./elements/vertex');
var Edge = require('./elements/edge');

module.exports = (function() {
  function Graph(gremlin) {
    this.gremlin = gremlin;
  }

  /**
   * Add a command to execute against the Graph and return a new Pipeline.
   *
   * @private
   * @param {String} methodName
   * @param {Array} args
   * @return {Pipeline}
   */
  Graph.prototype.add = function(methodName, args) {
    var pipeline = new Pipeline(this.gremlin);
    pipeline.gremlin.queryMain(methodName, args);

    return pipeline;
  };

  Graph.prototype.E = function() {
    return this.add('E', arguments);
  };

  Graph.prototype.V = function() {
    return this.add('V', arguments);
  };

  // Methods
  Graph.prototype.e = function() {
    return this.add('e', arguments);
  };

  Graph.prototype.idx = function() {
    return this.add('idx', arguments);
  };

  Graph.prototype.v = function() {
    return this.add('v', arguments);
  };

  // Indexing
  Graph.prototype.createIndex = function() {
    return this.add('createIndex', arguments);
  };

  Graph.prototype.createKeyIndex = function() {
    return this.add('createKeyIndex', arguments);
  };

  Graph.prototype.getIndices = function() {
    return this.add('getIndices', arguments);
  };

  Graph.prototype.getIndexedKeys = function() {
    return this.add('getIndexedKeys', arguments);
  };

  Graph.prototype.getIndex = function() {
    return this.add('getIndex', arguments);
  };

  Graph.prototype.dropIndex = function() {
    return this.add('dropIndex', arguments);
  };

  Graph.prototype.dropKeyIndex = function() {
    return this.add('dropKeyIndex', arguments);
  };

  // Types
  Graph.prototype.makeKey = function() {
    return this.add('makeKey', arguments);
  };

  Graph.prototype.clear = function() {
    return this.add('clear', arguments);
  };

  Graph.prototype.shutdown = function() {
    return this.add('shutdown', arguments);
  };

  Graph.prototype.getFeatures = function() {
    return this.add('getFeatures', arguments);
  };

  // Titan specifics
  Graph.prototype.getTypes = function() {
    return this.add('getTypes', arguments);
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
