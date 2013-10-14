var Utils = require("../utils"),
    isObject = Utils.isObject;

/*
 * Handle create/update/delete actions for Graph elements (vertices or edges)
 * within a transaction, setting their properties accordingly.
 *
 * ActionHandlers are bound to a transaction. One handler is instantiated for
 * each element in the transaction.
 */
var ActionHandler = (function() {
    function ActionHandler(element, transaction, actionArgs) {
        this.element = element;
        this.transaction = transaction;
        // array of arguments passed to the cud() action
        this.actionArgs = actionArgs;
        this.addToTransaction = true;
    }


    ActionHandler.prototype.handleAction = function(action) {
        this[action]();
    };

    // This method is common to Vertex and Edge.
    ActionHandler.prototype.delete = function() {
        this.element._id = this.actionArgs[0];

        if (this.actionArgs > 1) {
            this.element._keys = this.actionArgs[1];
        }
    };

    ActionHandler.build = function(element, transaction, actionArgs) {
        var handlers = {
            vertex: VertexActionHandler,
            edge: EdgeActionHandler
        };

        return new handlers[element._type](element, transaction, actionArgs);
    };

    return ActionHandler;

})();


/*
 * Prepares a Vertex for a transaction
 */
var VertexActionHandler = (function() {
    function VertexActionHandler() {
        ActionHandler.apply(this, arguments); // Call parent constructor
        this.vertex = this.element;

        // Allow for no actionArgs to be passed
        if (this.actionArgs.length === 0) {
            this.transaction.pendingVertices.push(element);
            this.addToTransaction = false;
        }
    }

    // Inherit from ActionHandler
    VertexActionHandler.prototype = Object.create(ActionHandler.prototype);
    VertexActionHandler.prototype.constructor = ActionHandler;


    function createUpdateVertex() {
        if (isObject(this.actionArgs[0])) {
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


/*
 * Prepares an Edge for a transaction
 */
var EdgeActionHandler = (function() {
    function EdgeActionHandler() {
        ActionHandler.apply(this, arguments); // Call parent constructor
        this.edge = this.element;
    }

    // Inherit from ActionHandler
    EdgeActionHandler.prototype = Object.create(ActionHandler.prototype);
    EdgeActionHandler.prototype.constructor = ActionHandler;


    function createUpdateEdge() {
        var argOffset = 0;

        if (this.actionArgs.length === 5) {
            // Called g.add|updateVertex(id, _outV, _inV, label, properties)
            argOffset = 1;
            this.edge._id = this.actionArgs[0];
        }

        this.edge._outV = this.actionArgs[0 + argOffset];
        this.edge._inV = this.actionArgs[1 + argOffset];
        this.edge._label = this.actionArgs[2 + argOffset];
    }

    EdgeActionHandler.prototype.create = createUpdateEdge;
    EdgeActionHandler.prototype.update = createUpdateEdge;

    return EdgeActionHandler;

})();


module.exports = ActionHandler;
