module.exports = (function() {
  function GremlinObject(object) {
    this.object = object;
    this.methods = [];
    this.identifier = '';
  }

  GremlinObject.prototype.toGroovy = function() {
    return this.object + this.methods.join('');
  };

  return GremlinObject;
})();