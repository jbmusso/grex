var request = require('request');

var ElementFactory = require("../elementfactory"),
    ActionHandlerFactory = require("./actionhandlers/actionhandlerfactory"),
    TransactionCommitter = require("./transactioncommitter");

var Gremlin = require("../gremlin");

module.exports = (function () {
  function Transaction(gRex, typeMap) {
    this.options = gRex.options;
    this.typeMap = typeMap;

    this.gRex = gRex;
    this.gremlin = new Gremlin(gRex.argumentHandler);
  }

  Transaction.prototype.commit = function(callback) {
    return this.gRex.exec(this.gremlin.script).nodeify(callback);
  };

  /**
   * Handle an action for an element of given type.
   *
   * @param {String} action
   * @param {String} type
   * @param {Array} args
   */
  Transaction.prototype.handleAction = function(action, type, args) {
    var element = ElementFactory.build(type);
    var actionhandler = ActionHandlerFactory.build(element, this, args);
    return actionhandler.handleAction(action);
  };

  Transaction.prototype.addVertex = function() {
    return this.handleAction('create', 'vertex', arguments);
  };

  Transaction.prototype.addEdge = function() {
    return this.handleAction('create', 'edge', arguments);
  };

  Transaction.prototype.removeVertex = function() {
    return this.handleAction('delete', 'vertex', arguments);
  };

  Transaction.prototype.removeEdge = function() {
    return this.handleAction('delete', 'edge', arguments);
  };

  Transaction.prototype.updateVertex = function() {
    return this.handleAction('update', 'vertex', arguments);
  };

  Transaction.prototype.updateEdge = function() {
    return this.handleAction('update', 'edge', arguments);
  };

  return Transaction;
})();
