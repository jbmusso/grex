/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require("lodash");

var ObjectWrapper = require('./objectwrapper');
var VertexWrapper = require('./vertex');
var EdgeWrapper = require('./edge');
var GremlinMethod = require('../functions/method');
var IdxGremlinFunction = require('../functions/graph/idx');
var AddVertexMethod = require('../functions/graph/addvertex');
var AddEdgeMethod = require('../functions/graph/addedge');

var PipelineWrapper = require('./pipeline');

module.exports = (function() {
  function GraphWrapper() {
    ObjectWrapper.apply(this, arguments);
  }

  inherits(GraphWrapper, ObjectWrapper);

  GraphWrapper.prototype.E = function() {
    var func = new GremlinMethod('E', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.V = function() {
    var func = new GremlinMethod('V', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.e = function() {
    var func = new GremlinMethod('e', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.idx = function() {
    var func = new IdxGremlinFunction(arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.v = function() {
    var func = new GremlinMethod('v', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  // Indexing
  GraphWrapper.prototype.createIndex = function() {
    var func = new GremlinMethod('createIndex', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.createKeyIndex = function() {
    var func = new GremlinMethod('createKeyIndex', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.getIndices = function() {
    var func = new GremlinMethod('getIndices', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.getIndexedKeys = function() {
    var func = new GremlinMethod('getIndexedKeys', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.getIndex = function() {
    var func = new GremlinMethod('getIndex', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.dropIndex = function() {
    var func = new GremlinMethod('dropIndex', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.dropKeyIndex = function() {
    var func = new GremlinMethod('dropKeyIndex', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  // Types
  GraphWrapper.prototype.makeKey = function() {
    var func = new GremlinMethod('makeKey', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.clear = function() {
    var func = new GremlinMethod('clear', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.shutdown = function() {
    var func = new GremlinMethod('shutdown', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  GraphWrapper.prototype.getFeatures = function() {
    var func = new GremlinMethod('getFeatures', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };

  // Titan specifics
  GraphWrapper.prototype.getTypes = function() {
    var func = new GremlinMethod('getTypes', arguments);

    var pipeline = new PipelineWrapper(this.objectName);
    pipeline.methods.push(func.toGroovy());

    return pipeline;
  };


  /**
   * Build a Gremlin line used for adding a VertexWrapper in the graph.
   *
   * Note: for databases which accept custom _id properties (ie. non generated)
   * the user must pass a valid _id value in the `properties` map rather than
   * supply an optional argument parameter as first argument (TinkerPop style).
   * This slight change to the API of addVertex makes it easier to use
   * in a JavaScript environment.
   *
   * @param {Object} properties
   * @param {String} object Optional variable name used within the script
   *    context
   * @return {VertexWrapper}
   */
  GraphWrapper.prototype.addVertex = function(properties, object) {
    var vertex = new VertexWrapper('g');
    var method = new AddVertexMethod(vertex, properties);

    method.run();

    vertex.methods.push(method.toGroovy());

    return vertex;
  };

  /**
   * @param {VertexWrapper|Number} v1
   * @param {VertexWrapper|Number} v2
   * @param {String} label
   * @param {Object} properties
   * @param {String} object Optional variable name used within the script
   *    context
   * @return {EdgeWrapper}
   */
  GraphWrapper.prototype.addEdge = function(v1, v2, label, properties, object) {
    var params = {
      v1: v1,
      v2: v2,
      label: label,
      properties: properties
    };

    var edge = new EdgeWrapper('g');
    var method = new AddEdgeMethod(edge, params);

    method.run();

    edge.methods.push(method.toGroovy());

    return edge;
  };

  return GraphWrapper;
})();
