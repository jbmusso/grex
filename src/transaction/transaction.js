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
    this.vertex = 0;
    this.edge = 0;
  }

  Transaction.prototype.commit = function(callback) {
    this.gremlin.computeTransactionScript();
    return this.gRex.exec(this.gremlin.script).nodeify(callback);
  };

  /**
   * Handle an action for an element of given type.
   *
   * @param {String} action
   * @param {String} type
   * @param {Array} args
   */
  Transaction.prototype.handleAction = function(actionName, type, args) {
    var element = ElementFactory.build(type);
    // Set and increment element's transaction id
    element.txid = ++this[type];
    var actionhandler = ActionHandlerFactory.build(element, this);

    // Call given action for element of given type, with given arguments
    actionhandler[actionName](actionName, args);

    return element;
  };

  Transaction.prototype.addVertex = function() {
    return this.handleAction('add', 'vertex', arguments);
  };

  Transaction.prototype.addEdge = function() {
    return this.handleAction('add', 'edge', arguments);
  };

  Transaction.prototype.removeVertex = function() {
    return this.handleAction('remove', 'vertex', arguments);
  };

  Transaction.prototype.removeEdge = function() {
    return this.handleAction('remove', 'edge', arguments);
  };

  Transaction.prototype.updateVertex = function() {
    return this.handleAction('update', 'vertex', arguments);
  };

  Transaction.prototype.updateEdge = function() {
    return this.handleAction('update', 'edge', arguments);
  };

  return Transaction;
})();
