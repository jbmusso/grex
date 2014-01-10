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

    // Allow for no actionArgs to be passed
    if (this.actionArgs.length === 0) {
        this.transaction.pendingVertices.push(this.element);
        this.addToTransaction = false;
    }
  }

  inherits(VertexActionHandler, ActionHandler);

  function createUpdateVertex() {
    if (_.isObject(this.actionArgs[0])) {
      // Called cud({..}), ie. user is expecting the graph database to autogenerate _id
      this.vertex.setProperties(this.actionArgs[0]);
      this.transaction.pendingVertices.push(this.vertex);
      this.addToTransaction = false;
    } else {
      // Called cud(id, {..})
      if(this.actionArgs.length === 2){ // called cud(id, {..})
          this.vertex.setProperties(this.actionArgs[1]);
      }

      this.vertex._id = this.actionArgs[0];
    }
  }

  VertexActionHandler.prototype.create = createUpdateVertex;
  VertexActionHandler.prototype.update = createUpdateVertex;

  return VertexActionHandler;

})();
