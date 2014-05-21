module.exports = (function() {
  function GremlinObject(gremlin, identifier) {
    Object.defineProperty(this, "gremlin", {
      value: gremlin,
      enumerable: false,
      writable: false
    });

    this.identifier = identifier;

  }

  return GremlinObject;
})();