var _ = require("lodash");

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
    var appendArg = '';
    var args = _.isArray(arguments[0]) ? arguments[0] : arguments;

    if (args.length > 1) {
      _.each(args[1], function(value, key) {
        appendArg = key + ":";
        appendArg += this.gremlin.argumentHandler.parse(args[1][key]);
      }, this);

      appendArg = "[["+ appendArg + "]]";
      args.length = 1; // ???
    }

    this.gremlin.append('.idx' + this.gremlin.argumentHandler.build(args));
    this.gremlin.append(appendArg);

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
        identifierPrefix = identifier ? identifier + ' = ' : '';

    vertex.identifier = identifier; // Non-enumerable property
    vertex.setProperties(properties);

    var gremlinLine = identifierPrefix +'g.addVertex('+ id + this.stringifyArgument(properties) +')';
    this.gremlin.line(gremlinLine);

    return vertex;
  };

  Graph.prototype.addEdge = function(v1, v2, label, properties, identifier) {
    var edge = new Edge(this.gremlin),
        optionalId = '';

    edge.identifier = identifier; // Non-enumerable property

    // edge._id = properties._id ? properties._id : null;
    if (properties._id) {
      edge._id = properties._id;
      optionalId = edge._id + ',';
    }

    edge._outV = arguments[0];
    edge._inV = arguments[1];
    edge._label = arguments[2];
    edge.setProperties(properties);
    delete properties._id;

    var gremlinLine = 'g.addEdge('+ optionalId + edge._outV.identifier +','+ edge._inV.identifier +',"'+ edge._label +'",'+ this.stringifyArgument(properties) +')';
    // console.log(gremlinLine);
    this.gremlin.line(gremlinLine);


    return edge;
  };

  Graph.prototype.stringifyArgument = function(argument) {
    return JSON.stringify(argument).replace('{', '[').replace('}', ']');
  };

  return Graph;
})();
