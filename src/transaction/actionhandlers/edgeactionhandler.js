var inherits = require("inherits");

var ActionHandler = require("./actionhandler");

/**
 * Prepares an Edge for a transaction
 */
module.exports = (function() {
  function EdgeActionHandler() {
    ActionHandler.apply(this, arguments); // Call parent constructor
    this.edge = this.element;
  }

  inherits(EdgeActionHandler, ActionHandler);

    var argOffset = 0;
  EdgeActionHandler.prototype.add = function(actionName, args) {
    var argOffset = 0,
        properties;

    if (args.length === 5) {
      // Called g.addEdge(id, _outV, _inV, label, properties)
      argOffset = 1;
      this.edge._id = args[0];
    } // else g.addEdge(_outV, _inV, label, properties) was called, leave _id to null (default factory value).


    this.edge._outV = args[0 + argOffset];
    this.edge._inV = args[1 + argOffset];
    this.edge._label = args[2 + argOffset];
  };

  /**
   * Note that it is not possible to update an edge _inV, _outV and _label
   * properties.
   */
  EdgeActionHandler.prototype.update = function(actionName, args) {
    // g.updateEdge(id, properties) was called
    this.edge._id = args[0];
    this.edge.setProperties(args[1]);
  };

  return EdgeActionHandler;

})();
