var Transaction = require("./transaction/transaction");

var Pipeline = require('./pipeline');


module.exports = (function() {

  function Graph(gRex) {
    this.gRex = gRex;
    this.typeMap = {};
    this.name = gRex.options.graph;
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
    var pipeline = new Pipeline(this.gRex);
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
   * Begin a new Transaction, passing any types eventually defined before.
   *
   * @public
   * @param {Object} typeMap A map of types
   * @return {Transaction}
   */
  Graph.prototype.begin = function (typeMap) {
      typeMap = typeMap ? _.extend(typeMap, this.typeMap) : this.typeMap;

      return new Transaction(this.gRex, typeMap);
  };

  return Graph;
})();
