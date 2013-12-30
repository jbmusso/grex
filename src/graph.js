var CommandBuilder = require("./gremlin");
var Transaction = require("./transaction/transaction");


module.exports = (function() {

  function Graph(gRex) {
    this.gRex = gRex;
    this.typeMap = {};
    this.name = gRex.options.graph;
    this.commandBuilder = new CommandBuilder(this);
  }

  Graph.prototype.exec = function(methodName, args) {
    var command = this.commandBuilder.queryMain(methodName, true).apply(this, args);
    return command;
  };

  Graph.prototype._ = function() {
    return this.exec('_', arguments);
  };

  Graph.prototype.E = function() {
    return this.exec('E', arguments);
  };

  Graph.prototype.V = function() {
    return this.exec('V', arguments);
  };

  // Methods
  Graph.prototype.e = function() {
    return this.exec('e', arguments);
  };

  Graph.prototype.idx = function() {
    return this.exec('idx', arguments);
  };

  Graph.prototype.v = function() {
    return this.exec('v', arguments);
  };

  // Indexing
  Graph.prototype.createIndex = function() {
    return this.exec('createIndex', arguments);
  };

  Graph.prototype.createKeyIndex = function() {
    return this.exec('createKeyIndex', arguments);
  };

  Graph.prototype.getIndices = function() {
    return this.exec('getIndices', arguments);
  };

  Graph.prototype.getIndexedKeys = function() {
    return this.exec('getIndexedKeys', arguments);
  };

  Graph.prototype.getIndex = function() {
    return this.exec('getIndex', arguments);
  };

  Graph.prototype.dropIndex = function() {
    return this.exec('dropIndex', arguments);
  };

  Graph.prototype.dropKeyIndex = function() {
    return this.exec('dropKeyIndex', arguments);
  };

  // Types
  Graph.prototype.makeKey = function() {
    return this.exec('makeKey', arguments);
  };

  Graph.prototype.clear = function() {
    return this.exec('clear', arguments);
  };

  Graph.prototype.shutdown = function() {
    return this.exec('shutdown', arguments);
  };

  Graph.prototype.getFeatures = function() {
    return this.exec('getFeatures', arguments);
  };

  // Titan specifics
  Graph.prototype.getTypes = function() {
    return this.exec('getTypes', arguments);
  };

  Graph.prototype.begin = function (typeMap) {
      typeMap = typeMap ? _.extend(typeMap, this.typeMap) : this.typeMap;

      return new Transaction(this.gRex.options, typeMap);
  };

  return Graph;
})();
