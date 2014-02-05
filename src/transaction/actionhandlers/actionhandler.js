var addTypes = require("../../addtypes");
var _ = require("lodash");
/**
 * Handle create/update/delete actions for Graph elements (vertices or edges)
 * within a transaction, setting their properties accordingly.
 *
 * ActionHandlers are bound to a transaction. One handler is instantiated for
 * each element in the transaction.
 */
module.exports = (function() {
  function ActionHandler(element, transaction) {
    this.element = element;
    this.transaction = transaction;
  }

  };

  // This method is common to Vertex and Edge.
  ActionHandler.prototype.delete = function(actionName, args) {
    var _id;

    if (_.isObject(args[0])) {
      _id = args[0]._id;
    } else {
      // arg is a Number
      _id = args[0];
    }
    this.element._id = _id;

    // Indicates that an array of property keys was passed: this will not remove the element but only remove these keys.
    if (args.length > 1) {
      this.element._keys = args[1];
    }
  };

  return ActionHandler;

})();
