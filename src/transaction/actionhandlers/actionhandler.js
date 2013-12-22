var addTypes = require("../../addtypes");

/*
 * Handle create/update/delete actions for Graph elements (vertices or edges)
 * within a transaction, setting their properties accordingly.
 *
 * ActionHandlers are bound to a transaction. One handler is instantiated for
 * each element in the transaction.
 */
module.exports = (function() {
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

    if (_.isObject(this.actionArgs[0])) {
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
