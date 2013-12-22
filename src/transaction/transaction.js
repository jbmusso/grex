var ElementFactory = require("../elementfactory"),
    ActionHandler = require("./actionhandlers/actionhandler"),
    TransactionCommitter = require("./transactioncommitter");


module.exports = (function () {
    function Transaction(options, typeMap) {
        this.committer = new TransactionCommitter(this);
        this.OPTS = options;
        this.typeMap = typeMap;
        this.txArray = [];
        this.pendingVertices = [];
    }


    function cud(action, type) {
        return function() {
            var element = ElementFactory.build(type),
                // Instantiate an actionhandler everytime cud() is called.
                // TODO: improve this, and pass element to prepareElementFor() instead. Will avoid instantiating a ActionHandler every time.
                actionhandler = ActionHandler.build(element, this, arguments);

            element = actionhandler.handleAction(action); //returns "element"

            return element;
        };
    }

    Transaction.prototype.commit = function() {
        return this.committer.doCommit();
    };

    Transaction.prototype.addVertex = cud('create', 'vertex');

    Transaction.prototype.addEdge = cud('create', 'edge');

    Transaction.prototype.removeVertex = cud('delete', 'vertex');

    Transaction.prototype.removeEdge = cud('delete', 'edge');

    Transaction.prototype.updateVertex = cud('update', 'vertex');

    Transaction.prototype.updateEdge = cud('update', 'edge');

    return Transaction;
})();
