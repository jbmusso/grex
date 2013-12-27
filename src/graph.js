var CommandBuilder = require("./gremlin");
var Transaction = require("./transaction/transaction");
var ResultFormatter = require("./resultformatter");


module.exports = (function() {

  function Graph(options) {
    this.options = options;
    this.typeMap = {};
    this.resultFormatter = new ResultFormatter();
  }

  Graph.prototype.V = CommandBuilder.queryMain('V', true);
  Graph.prototype._ = CommandBuilder.queryMain('_', true);
  Graph.prototype.E = CommandBuilder.queryMain('E', true);
  Graph.prototype.V =  CommandBuilder.queryMain('V', true);

  //Methods
  Graph.prototype.e = CommandBuilder.queryMain('e', true);
  Graph.prototype.idx = CommandBuilder.queryMain('idx', true);
  Graph.prototype.v = CommandBuilder.queryMain('v', true);

  //Indexing
  Graph.prototype.createIndex = CommandBuilder.queryMain('createIndex', true);
  Graph.prototype.createKeyIndex = CommandBuilder.queryMain('createKeyIndex', true);
  Graph.prototype.getIndices = CommandBuilder.queryMain('getIndices', true);
  Graph.prototype.getIndexedKeys = CommandBuilder.queryMain('getIndexedKeys', true);
  Graph.prototype.getIndex = CommandBuilder.queryMain('getIndex', true);
  Graph.prototype.dropIndex = CommandBuilder.queryMain('dropIndex', true);
  Graph.prototype.dropKeyIndex = CommandBuilder.queryMain('dropKeyIndex', true);

  //Types
  Graph.prototype.makeKey = CommandBuilder.queryMain('makeKey', true);

  Graph.prototype.clear =  CommandBuilder.queryMain('clear', true);
  Graph.prototype.shutdown = CommandBuilder.queryMain('shutdown', true);
  Graph.prototype.getFeatures = CommandBuilder.queryMain('getFeatures', true);

  // Titan specifics
  Graph.prototype.getTypes = CommandBuilder.queryMain('getTypes', true);

  Graph.prototype.begin = function (typeMap) {
      typeMap = typeMap ? _.extend(typeMap, this.typeMap) : this.typeMap;

      return new Transaction(this.options, typeMap);
  };

  return Graph;
})();
