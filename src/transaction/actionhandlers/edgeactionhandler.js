var inherits = require("inherits");

var ActionHandler = require("./actionhandler");

/*
 * Prepares an Edge for a transaction
 */
module.exports = (function() {
  function EdgeActionHandler() {
    ActionHandler.apply(this, arguments); // Call parent constructor
    this.edge = this.element;
  }

  inherits(EdgeActionHandler, ActionHandler);

  EdgeActionHandler.prototype.create = function() {
    var argOffset = 0;

    if (this.actionArgs.length === 5) {
      // Called g.addEdge(id, _outV, _inV, label, properties)
      argOffset = 1;
      this.edge._id = this.actionArgs[0];
    } // else g.addEdge(_outV, _inV, label, properties) was called, leave _id to null (default factory value).

    this.edge._outV = this.actionArgs[0 + argOffset];
    this.edge._inV = this.actionArgs[1 + argOffset];
    this.edge._label = this.actionArgs[2 + argOffset];
    this.edge.setProperties(this.actionArgs[3 + argOffset]);
  };

  /*
   * Note that it is not possible to update an edge _inV, _outV and _label
   * properties.
   */
  EdgeActionHandler.prototype.update = function() {
    // g.updateEdge(id, properties) was called
    this.edge._id = this.actionArgs[0];
    this.edge.setProperties(this.actionArgs[1]);
  };

  return EdgeActionHandler;

})();
