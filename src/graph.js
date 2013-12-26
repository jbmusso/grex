var queryMain = require("./gremlin");
var Transaction = require("./transaction/transaction");
var ResultFormatter = require("./resultformatter");


module.exports = (function() {

  function Graph(options) {
    this.options = options;
    this.typeMap = {};
    this.resultFormatter = new ResultFormatter();
  }

  Graph.prototype.V = queryMain('V', true);
  Graph.prototype._ = queryMain('_', true);
  Graph.prototype.E = queryMain('E', true);
  Graph.prototype.V =  queryMain('V', true);

  //Methods
  Graph.prototype.e = queryMain('e', true);
  Graph.prototype.idx = queryMain('idx', true);
  Graph.prototype.v = queryMain('v', true);

  //Indexing
  Graph.prototype.createIndex = queryMain('createIndex', true);
  Graph.prototype.createKeyIndex = queryMain('createKeyIndex', true);
  Graph.prototype.getIndices = queryMain('getIndices', true);
  Graph.prototype.getIndexedKeys = queryMain('getIndexedKeys', true);
  Graph.prototype.getIndex = queryMain('getIndex', true);
  Graph.prototype.dropIndex = queryMain('dropIndex', true);
  Graph.prototype.dropKeyIndex = queryMain('dropKeyIndex', true);

  //Types
  Graph.prototype.makeKey = queryMain('makeKey', true);

  Graph.prototype.clear =  queryMain('clear', true);
  Graph.prototype.shutdown = queryMain('shutdown', true);
  Graph.prototype.getFeatures = queryMain('getFeatures', true);

  // Titan specifics
  Graph.prototype.getTypes = queryMain('getTypes', true);

  Graph.prototype.begin = function (typeMap) {
      typeMap = typeMap ? _.extend(typeMap, this.typeMap) : this.typeMap;

      return new Transaction(this.options, typeMap);
  };

  return Graph;
})();
