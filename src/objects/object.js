module.exports = (function() {
  function GremlinObject(identifier) {
    this.identifier = identifier;
    this.methods = [];
  }

  GremlinObject.prototype.toGroovy = function() {
    return this.identifier + this.methods.join('.');
  };

  return GremlinObject;
})();