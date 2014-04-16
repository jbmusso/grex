var _ = require("lodash");


var GremlinMethod = require('./functions/method');
var IdxGremlinFunction = require('./functions/graph/idx');
var AddVertexMethod = require('./functions/graph/addvertex');
var AddEdgeMethod = require('./functions/graph/addedge');

var Pipeline = require('./pipeline');

module.exports = (function() {
  function Graph(parentGremlin) {
    this.parentGremlin = parentGremlin;
    this.gremlin = this.parentGremlin.subScript();
  }

  Graph.prototype.E = function() {
    var func = new GremlinMethod('E', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.V = function() {
    var func = new GremlinMethod('V', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.e = function() {
    var func = new GremlinMethod('e', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.idx = function() {
    var func = new IdxGremlinFunction(arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.v = function() {
    var func = new GremlinMethod('v', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  // Indexing
  Graph.prototype.createIndex = function() {
    var func = new GremlinMethod('createIndex', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.createKeyIndex = function() {
    var func = new GremlinMethod('createKeyIndex', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndices = function() {
    var func = new GremlinMethod('getIndices', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndexedKeys = function() {
    var func = new GremlinMethod('getIndexedKeys', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getIndex = function() {
    var func = new GremlinMethod('getIndex', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.dropIndex = function() {
    var func = new GremlinMethod('dropIndex', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.dropKeyIndex = function() {
    var func = new GremlinMethod('dropKeyIndex', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  // Types
  Graph.prototype.makeKey = function() {
    var func = new GremlinMethod('makeKey', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.clear = function() {
    var func = new GremlinMethod('clear', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.shutdown = function() {
    var func = new GremlinMethod('shutdown', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  Graph.prototype.getFeatures = function() {
    var func = new GremlinMethod('getFeatures', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };

  // Titan specifics
  Graph.prototype.getTypes = function() {
    var func = new GremlinMethod('getTypes', arguments);
    this.gremlin.append('g' + func.toGroovy());

    return new Pipeline(this.gremlin);
  };


  /**
   * Build a Gremlin line used for adding a Vertex in the graph.
   * Note: for databases which accept custom _id properties (ie. non generated)
   * the user must pass a valid _id value in the `properties` map rather thant
   * supply an optional argument parameter as first argument (TinkerPop style).
   * This slight change to the API of addVertex makes it easier to use
   * in a JavaScript environment.
   *
   * @param {Object} properties
   * @param {String} identifier Optional variable name used within the script context
   */
  Graph.prototype.addVertex = function(properties, identifier) {
    var method = new AddVertexMethod(properties);
    var vertex = method.run(this.gremlin, identifier);

    this.gremlin.line(method.toGroovy());
    this.parentGremlin.append(this.gremlin.script);

    return vertex;
  };

  Graph.prototype.addEdge = function(v1, v2, label, properties, identifier) {
    var params = {
      v1: v1,
      v2: v2,
      label: label,
      properties: properties
    };

    var method = new AddEdgeMethod(params);
    var edge = method.run(this.gremlin, identifier);

    this.gremlin.line(method.toGroovy());
    this.parentGremlin.append(this.gremlin.script);

    return edge;
  };

  return Graph;
})();
