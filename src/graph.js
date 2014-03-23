var _ = require("lodash");

var Pipeline = require('./pipeline');
var Vertex = require('./elements/vertex');
var Edge = require('./elements/edge');

module.exports = (function() {
  function Graph(parentGremlin) {
    this.parentGremlin = parentGremlin;
    this.gremlin = this.parentGremlin.subScript();
  }

  Graph.prototype.E = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('E', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.V = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('V', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.e = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('e', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.idx = function() {
    var indexName = arguments[0];
    var properties = arguments[1];

    this.gremlin.append('g');
    this.gremlin.append(".idx('" + indexName + "')");

    if (properties) {
      var appendArg = '';

      _.each(properties, function(value, key) {
        appendArg = key + ":'" + value + "'";
      });

      appendArg = "[["+ appendArg + "]]";
      this.gremlin.append(appendArg);
    }

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.v = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('v', arguments);

    return new Pipeline(this.gremlin);
  };

  // Indexing
  Graph.prototype.createIndex = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('createIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.createKeyIndex = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('createKeyIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndices = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('getIndices', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndexedKeys = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('getIndexedKeys', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndex = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('getIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.dropIndex = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('dropIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.dropKeyIndex = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('dropKeyIndex', arguments);

    return new Pipeline(this.gremlin);
  };

  // Types
  Graph.prototype.makeKey = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('makeKey', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.clear = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('clear', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.shutdown = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('shutdown', arguments);

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getFeatures = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('getFeatures', arguments);

    return new Pipeline(this.gremlin);
  };

  // Titan specifics
  Graph.prototype.getTypes = function() {
    this.gremlin.append('g');
    this.gremlin.appendMain('getTypes', arguments);

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
    var vertex = new Vertex(this.gremlin);
    var id = properties._id ? properties._id +',' : '';
    var identifierPrefix = identifier ? identifier + ' = ' : '';

    vertex.identifier = identifier; // Non-enumerable property

    _.each(properties, function(value, key) {
      vertex[key] = value;
    });

    var gremlinLine = identifierPrefix +'g.addVertex('+ id + this.gremlin.stringifyArgument(properties) +')';
    this.gremlin.line(gremlinLine);

    this.parentGremlin.append(this.gremlin.script);

    return vertex;
  };

  Graph.prototype.addEdge = function(v1, v2, label, properties, identifier) {
    var edge = new Edge(this.gremlin);
    var optionalId = '';

    edge.identifier = identifier; // Non-enumerable property

    if (properties._id) {
      edge._id = properties._id;
      optionalId = edge._id + ',';
    }

    edge._outV = arguments[0];
    edge._inV = arguments[1];
    edge._label = arguments[2];

    _.each(properties, function(value, key) {
      edge[key] = value;
    });

    delete properties._id;

    var gremlinLine = 'g.addEdge('+ optionalId + edge._outV.identifier +','+ edge._inV.identifier +',"'+ edge._label +'",'+ this.gremlin.stringifyArgument(properties) +')';

    this.gremlin.line(gremlinLine);

    this.parentGremlin.append(this.gremlin.script);

    return edge;
  };

  return Graph;
})();
