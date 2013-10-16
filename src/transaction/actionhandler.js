var Utils = require("../utils"),
    isObject = Utils.isObject,
    addTypes = require("../addtypes");

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

    /*
     * @return {Element}
     */
    ActionHandler.prototype.handleAction = function(action) {
        var typedElement;
        this[action]();

        if (this.addToTransaction) {
            this.element._action = action;
            typedElement = addTypes(this.element, this.transaction.typeMap);

            this.transaction.txArray.push(typedElement);
        }

        return this.element;
    };

    // This method is common to Vertex and Edge.
    ActionHandler.prototype.delete = function() {
        var _id;

        if (isObject(this.actionArgs[0])) {
            _id = this.actionArgs[0]._id;
        } else {
            // arg is a Number
            _id = this.actionArgs[0];
        }
        this.element._id = _id;

        // Indicates that an array of property keys was passed: this will not remove the element but only remove these keys.
        if (this.actionArgs.length > 1) {
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
            this.transaction.pendingVertices.push(this.element);
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

/*
 * Exports
 */
exports.VertexActionHandler = VertexActionHandler;
exports.EdgeActionHandler = EdgeActionHandler;
exports.ActionHandler = ActionHandler;

module.exports = exports;
