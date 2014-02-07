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

  EdgeActionHandler.prototype.add = function(actionName, args) {
    var argOffset = 0,
        properties;

    if (args.length === 5) {
      // Called g.addEdge(id, _outV, _inV, label, properties)
      argOffset = 1;
      this.edge._id = args[0];
    } // else g.addEdge(_outV, _inV, label, properties) was called, leave _id to null (default factory value).

    properties = args[3 + argOffset];

    this.edge._outV = args[0 + argOffset];
    this.edge._inV = args[1 + argOffset];
    this.edge._label = args[2 + argOffset];
    this.edge.setProperties(properties);


    gremlinLine = 'g.addEdge('+ this.edge._outV._id +','+this.edge._inV._id+',"'+ this.edge._label +'",'+ this.stringifyArgument(properties) +')';
    this.transaction.gremlin.addLine(gremlinLine);
  };

  return EdgeActionHandler;

})();
