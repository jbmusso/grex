var q = require("q");
var request = require("request");
var _ = require("lodash");

var Utils = require("../utils"),
    addTypes = require("../addtypes");


module.exports = (function() {
    /*
     * Constructor
     *
     * @param {Transaction} a transaction due for commit
     */
    function TransactionCommitter(transaction) {
        this.transaction = transaction;
        this.inError = null;
    }

    /*
     * Main commit method.
     *
     * @see Transaction#commit
     *
     * @return {Promise}
     * @api public
     */
    TransactionCommitter.prototype.doCommit = function() {
        if(!!this.transaction.pendingVertices.length){
            // We have new vertices to create first!
            commit = this.commitVertices();
        } else {
            commit = this.commitEdges();
        }

        return commit;
    };

    /*
     * Post vertices in batch to the database, eventually rolling them back
     * in case of a failure.
     *
     * Internally calls updatePendingVertices() and, in the absence of a
     * failure, calls updateEdges().
     *
     * @return {Promise}
     * @api private
     */
    TransactionCommitter.prototype.commitVertices = function() {
        var self = this;

        return this.getPostVerticesPromises().then(function(result){
            self.updatePendingVertices(result);

            if(this.inError){
                return self.rollbackVertices()
                    .then(function(result){
                        throw result;
                    },function(error){
                        throw error;
                    });
            }

            //Update any edges that may have referenced the newly created Vertices
            self.updateEdges();

            return self.postBatch({ tx: self.transaction.txArray });

        }, function(err){
            console.error(err);
        });
    };

    /*
     * Post edges in batch to the database, replacing _inV and _outV
     * references to Vertices as references to vertices _id.
     *
     * @return {Promise} of posting edges in batch.
     * @api private
     */
    TransactionCommitter.prototype.commitEdges = function() {
        // We don't have new vertices to create, only edges...
        _.each(this.transaction.txArray, function(graphElement) {
            if (graphElement._type == 'edge' && graphElement._action == 'create'){
                if (_.isObject(graphElement._inV)) {
                    graphElement._inV = graphElement._inV._id;
                }

                if (_.isObject(graphElement._outV)) {
                    graphElement._outV = graphElement._outV._id;
                }
            }
        });

        return this.postBatch({ tx: this.transaction.txArray });
    };

    /*
     * Post JSON data representing graph elements to the appropriate
     * Rexster endpoint via http.
     *
     * @param {String} urlPath
     * @param {Object} keys/values representing a graph element
     * @param {Object} optional 'Content-Type' headers
     * @return {Promise}
     * @api private
     */
    TransactionCommitter.prototype.postData = function(urlPath, data, headers) {
        var self = this;
        var deferred = q.defer();

        var url = 'http://' + this.transaction.options.host + ':' + this.transaction.options.port + '/graphs/' + this.transaction.options.graph + urlPath;

        var options = {
            url: url,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json' // May be overridden
            }
        };

        // Specify custom headers, if any
        if (headers) {
            _.forOwn(headers, function(value, name) {
                options.headers[name] = value;
            });
        }

        request.post(options, function(err, res, body) {
            if (err) {
                // Handle any HTTP request error, not Rexster errors
                console.error('Problem with request: ' + err);
                deferred.reject(err);
            }

            body = JSON.parse(body);

            if('success' in body && body.success === false){
                //send error info with reject
                if(self.transaction.pendingVertices && !!self.transaction.pendingVertices.length){
                    //This indicates that all new Vertices were created but failed to
                    //complete the rest of the tranasction so the new Vertices need deleted
                    self.rollbackVertices()
                    .then(function(result){
                        deferred.reject(result);
                    },function(error){
                        deferred.reject(error);
                    });

                } else {
                    deferred.reject(body);
                }
            } else {
                //This occurs after pendingVertices have been created
                //and passed in to postData
                if(!('results' in body) && self.transaction.pendingVertices && !!self.transaction.pendingVertices.length){
                    body.pendingVertices = [];
                    // push.apply(body.pendingVertices, self.transaction.pendingVertices);
                    body.pendingVertices.push(self.transaction.pendingVertices);

                    self.transaction.pendingVertices.length = 0;
                }

                if('tx' in data){
                    data.tx.length = 0;
                }

                deferred.resolve(body);
            }
        });

        return deferred.promise;
    };

    /*
     * A convenient method for posting in batch.
     *
     * @api private
     */
    TransactionCommitter.prototype.postBatch = function(data, headers) {
        return this.postData('/tp/batch/tx', data, headers);
    };


    /*
     * A convenient method for posting vertices.
     *
     * @api private
     */
    TransactionCommitter.prototype.postVertices = function(data, headers) {
        return this.postData('/vertices', data, headers);
    };

    /*
     * For all pending "edges", replace _inV and _outV references to Vertex
     * object by references to Vertex _id.
     *
     * @api private
     */
    TransactionCommitter.prototype.updateEdges = function() {
        _.each(this.transaction.txArray, function(graphElement) {
            if  (graphElement._type == 'edge' && graphElement._action == 'create'){
                // Replace references to Vertex object by references to Vertex _id.
                // TODO: Try replacing the following two checks with getters for _inV and _outV in Edge prototype.
                if (_.isObject(graphElement._inV)) {
                    graphElement._inV = graphElement._inV._id;
                }

                if (_.isObject(graphElement._outV)) {
                    graphElement._outV = graphElement._outV._id;
                }
            }
        });
    };

    /*
     * Update the _id of vertices pending for creations with ids generated by
     * the database.
     *
     * @param {Array} of element result fetched from the database
     * @api private
     */
    TransactionCommitter.prototype.updatePendingVertices = function(results) {
        var inError = false;

        //Update the _id for the created Vertices
        _.each(results, function(result, j) {
            if('results' in result && '_id' in result.results){
                this.transaction.pendingVertices[j]._id = result.results._id;
            } else {
                this.inError = true;
            }
        }, this);
    };

    /*
     * For each pending vertices, build and return a "promise for all promise
     * of creation of each vertex in the database".
     *
     * @return {Promise}
     * @api private
     */
    TransactionCommitter.prototype.getPostVerticesPromises = function() {
        var promises = [],
            header = {'Content-Type':'application/vnd.rexster-typed-v1+json'};

        _.each(this.transaction.pendingVertices, function(vertex) {
            var types = addTypes(vertex, this.transaction.typeMap);
            promises.push(this.postVertices(types, header));
        }, this);

        return q.all(promises);
    };

    /*
     * Called when rolling back vertices: for each pending vertices, add a
     * "removeVertex()" instruction to the transaction.
     *
     * @api private
     */
    TransactionCommitter.prototype.removeVertices = function() {
        _.each(this.transaction.pendingVertices, function(vertex) {
            // check if any vertices were created and create a Transaction
            // to delete them from the database
            if ('_id' in vertex){
                this.transaction.removeVertex(vertex._id);
            }
        });

        this.transaction.pendingVertices.length = 0;
    };

    /*
     * Remove all pending vertices in batch from the graph database. Internally
     * calls "postBatch()".
     *
     * @return {Object} An error object
     * @api private
     */
    TransactionCommitter.prototype.rollbackVertices = function() {
        var self = this;
        var errObj = {
            success: false,
            message : ""
        };
        //In Error because couldn't create new Vertices. Therefore,
        //roll back all other transactions
        console.error('Problem with Transaction. Rolling back vertices...');

        this.transaction.txArray.length = 0; // "clears" array
        this.removeVertices();

        //This indicates that nothing was able to be created as there
        //is no need to create a tranasction to delete the any vertices as there
        //were no new vertices successfully created as part of this Transaction

        if (!this.transaction.txArray.length){
            return q.fcall(function () {
                errObj.message = "Could not complete transaction. Transaction has been rolled back.";

                return errObj;
            });
        }

        //There were some vertices created which now need to be deleted from
        //the database. On success throw error to indicate transaction was
        //unsuccessful. On fail throw error to indicate that transaction was
        //unsuccessful and that the new vertices created were unable to be removed
        //from the database and need to be handled manually.
        return this.postBatch({ tx: this.transaction.txArray })
            .then(function(success){
                errObj.message = "Could not complete transaction. Transaction has been rolled back.";

                return errObj;
            }, function(fail){
                errObj.message = "Could not complete transaction. Unable to roll back newly created vertices.";
                errObj.ids = self.transaction.txArray.map(function(item){
                    return item._id;
                });

                self.transaction.txArray.length = 0;

                return errObj;
            });
    };

    return TransactionCommitter;

})();
