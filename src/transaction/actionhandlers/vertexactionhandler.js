var inherits = require("inherits");
var _ = require("lodash");

var ActionHandler = require("./actionhandler");

/**
 * Prepares a Vertex for a transaction
 */
module.exports = (function() {
  function VertexActionHandler() {
    ActionHandler.apply(this, arguments); // Call parent constructor
    this.vertex = this.element;
  }

  inherits(VertexActionHandler, ActionHandler);

  function addUpdateVertex(actionName, args) {
    var properties,
        id,
        gremlinLine;

    if (_.isObject(args[0])) {
      // Called addVertex({..}) or updateVertex({..}), ie. user is expecting the graph database to autogenerate _id
      properties = args[0];
      this.vertex.setProperties(properties);
    } else {
      // Called addVertex(id) or updateVertex(id) with no arguments
      this.vertex._id = args[0];

      // Called addVertex(id, {..}) or updateVertex(id, {..})
      if (args.length === 2) {
        id = args[0];
        properties = args[1];
        this.vertex.setProperties(properties);

      this.vertex._id = this.actionArgs[0];
    }
  }

  VertexActionHandler.prototype.add = addUpdateVertex;

  VertexActionHandler.prototype.update = addUpdateVertex;

  return VertexActionHandler;

})();
