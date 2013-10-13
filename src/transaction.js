var Element = require("./element"),
    ActionHandler = require("./actionhandler"),
    TransactionCommitter = require("./transactioncommitter"),
    addTypes = require("./addtypes");


module.exports = (function () {
    function Transaction(options, typeMap) {
        console.log(typeMap);

        this.committer = new TransactionCommitter(this);
        this.OPTS = options;
        this.typeMap = typeMap;
        this.pendingElements = [];
        this.pendingVertices = [];
    }


    function cud(action, type) {
        return function() {
            var element = Element.build(type),
                // Instantiate an actionhandler everytime cud() is called.
                // TODO: improve this, and pass element to prepareElementFor() instead. Will avoid instantiating a ActionHandler every time.
                actionhandler = ActionHandler.build(element, this, arguments);

            actionhandler.handleAction(action);

            if (actionhandler.addToTransaction) {
                element._action = action;
                this.pendingElements.push(addTypes(element, this.typeMap));
            }

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
