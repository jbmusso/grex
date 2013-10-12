var q = require("q"),
    http = require("http"),
    Utils = require("./utils"),
    Element = require("./element"),
    ActionHandler = require("./actionhandler");

var typeHash = {
    'integer': 'i',
    'long': 'l',
    'float': 'f',
    'double': 'd',
    'string': 's',
    'boolean': 'b',
    'i': 'i',
    'l': 'l',
    'f': 'f',
    'd': 'd',
    's': 's',
    'b': 'b',
    'list': 'list',
    'map': 'map'
};

var isObject = Utils.isObject;
var isArray = Utils.isArray;

var push = Array.prototype.push;


var pathBase = '/graphs/';
var batchExt = '/tp/batch/tx';
var newVertex = '/vertices';

module.exports = (function () {
    function Trxn(options, typeMap) {
        this.OPTS = options;
        this.typeMap = typeMap;
        this.transactionArray = [];
        this.pendingVertices = [];
    }

    function addTypes(obj, typeDef, embedded, list){
        var tempObj = {};
        var tempStr = '';
        var obj2, idx = 0;

        for(var k in obj){
            if(obj.hasOwnProperty(k)){
                if(typeDef){
                    if ((k in typeDef) && isObject(typeDef[k])) {
                        if(embedded){
                            if (list) {
                                obj2 = obj[k];

                                for(var k2 in obj2){
                                    if(obj2.hasOwnProperty(k2)){
                                        if(typeDef[k] && (k2 in typeDef[k])){
                                            tempStr += '(map,(' + addTypes(obj[k], typeDef[k], true) + '))';
                                        }
                                    }
                                }
                            } else {
                                tempStr += k + '=(map,(' + addTypes(obj[k], typeDef[k], true) + '))';
                            }
                            tempStr = tempStr.replace(')(', '),(');
                        } else {
                            tempObj[k] = '(map,(' + addTypes(obj[k], typeDef[k], true) + '))';
                        }
                    } else if ((k in typeDef) && isArray(typeDef[k])) {
                        if(embedded){
                            tempStr += '(list,(' + addTypes(obj[k], typeDef[k], true, true) + '))';
                            tempStr = tempStr.replace(')(', '),(');
                        } else {
                            tempObj[k] = '(list,(' + addTypes(obj[k], typeDef[k], true, true) + '))';
                        }
                    } else {
                        if(embedded){
                            if (list) {
                                if (k in typeDef) {
                                    idx = k;
                                    tempStr += '(' + typeHash[typeDef[idx]] + ',' + obj[k] + ')';
                                } else {
                                    idx = typeDef.length - 1;
                                    if (isObject(typeDef[idx])) {
                                        tempStr += ',(map,(' + addTypes(obj[k], typeDef[idx], true) + '))';
                                    } else if (isArray(typeDef[idx])){
                                        tempStr += ',(list,(' + addTypes(obj[k], typeDef[idx], true, true) + '))';
                                    } else {
                                      tempStr += '(' + typeHash[typeDef[idx]] + ',' + obj[k] + ')';
                                    }
                                }
                                tempStr = tempStr.replace(')(', '),(');
                            } else {
                                if (k in typeDef) {
                                    tempStr += k + '=(' + typeHash[typeDef[k]] + ',' + obj[k] + ')';
                                    tempStr = tempStr.replace(')(', '),(');
                                } else {
                                    tempObj[k] = obj[k];
                                }
                            }
                        } else {
                            if (k in typeDef) {
                                tempObj[k] = '(' + typeHash[typeDef[k]] + ',' + obj[k] + ')';
                            } else {
                                tempObj[k] = obj[k];
                            }
                        }
                    }
                } else {
                    tempObj[k] = obj[k];
                }
            }
        }

        return embedded ? tempStr : tempObj;
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
                this.transactionArray.push(addTypes(element, this.typeMap));
            }

            return element;
        };
    }

    //returns an error Object
    function rollbackVertices(){
        var self = this;
        var errObj = { success: false, message : "" };
        //In Error because couldn't create new Vertices. Therefore,
        //roll back all other transactions
        console.error('problem with Transaction');
        self.transactionArray.length = 0; // "clears" array

        for (var i = self.pendingVertices.length - 1; i >= 0; i--) {
            //check if any vertices were created and create a Transaction
            //to delete them from the database
            if('_id' in self.pendingVertices[i]){
                self.removeVertex(self.pendingVertices[i]._id);
            }
        }

        //This indicates that nothing was able to be created as there
        //is no need to create a tranasction to delete the any vertices as there
        //were no new vertices successfully created as part of this Transaction
        self.pendingVertices.length = 0;

        if (!self.transactionArray.length){
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
        return postData.call(self, batchExt, { tx: self.transactionArray })
            .then(function(success){
                errObj.message = "Could not complete transaction. Transaction has been rolled back.";

                return errObj;
            }, function(fail){
                errObj.message = "Could not complete transaction. Unable to roll back newly created vertices.";
                errObj.ids = self.transactionArray.map(function(item){
                    return item._id;
                });
                self.transactionArray.length = 0;

                return errObj;
            });
    }


    Trxn.prototype.commit = function post() {
        var self = this;

        function doCommit() {
            var promises = [];
            var transactionElement;

            if(!!self.pendingVertices.length){
                // We have new vertices to create first!

                for (var i = 0; i < self.pendingVertices.length; i++) {
                    promises.push(postData.call(self, newVertex, addTypes(self.pendingVertices[i], self.typeMap), {'Content-Type':'application/vnd.rexster-typed-v1+json'}));
                }

                return q.all(promises).then(function(result){
                    var inError = false;
                    //Update the _id for the created Vertices
                    for (var j = 0; j < result.length; j++) {
                        if('results' in result[j] && '_id' in result[j].results){
                            self.pendingVertices[j]._id = result[j].results._id;
                        } else {
                            inError = true;
                        }
                    }

                    if(inError){
                        return rollbackVertices.call(self)
                            .then(function(result){
                                throw result;
                            },function(error){
                                throw error;
                            });
                    }

                    //Update any edges that may have referenced the newly created Vertices
                    for (var k = 0; k < self.transactionArray.length; k++) {
                        transactionElement = self.transactionArray[k];

                        if(transactionElement._type == 'edge' && transactionElement._action == 'create'){
                            // Replace references to Vertex object by references to Vertex _id.
                            // TODO: Try replacing the following two checks with getters for _inV and _outV in Edge prototype.
                            if (isObject(transactionElement._inV)) {
                                transactionElement._inV = transactionElement._inV._id;
                            }

                            if (isObject(transactionElement._outV)) {
                                transactionElement._outV = transactionElement._outV._id;
                            }
                        }
                    }

                    return postData.call(self, batchExt, { tx: self.transactionArray });

                }, function(err){
                    console.error(err);
                });

            } else {
                // We don't have new vertices to create, only edges...
                for (var k = 0; k < self.transactionArray.length; k++) {
                    transactionElement = self.transactionArray[k];

                    if(transactionElement._type == 'edge' && transactionElement._action == 'create'){
                        if (isObject(transactionElement._inV)) {
                            transactionElement._inV = transactionElement._inV._id;
                        }

                        if (isObject(transactionElement._outV)) {
                            transactionElement._outV = transactionElement._outV._id;
                        }
                    }
                }

                return postData.call(self, batchExt, { tx: self.transactionArray });
            }
        }

        return doCommit();
    };


    function postData(urlPath, data, headers){
        var self = this;
        var deferred = q.defer();

        var payload = JSON.stringify(data) || '{}';

        var options = {
            'host': this.OPTS.host,
            'port': this.OPTS.port,
            'path': pathBase + this.OPTS.graph,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload, 'utf8')
            },
            'method': 'POST'
        };

        if(headers){
            for(var prop in headers){
                if(headers.hasOwnProperty(prop)){
                    options.headers[prop] = headers[prop];
                }
            }
        }

        options.path += urlPath;

        var req = http.request(options, function(res) {
            var body = '';
            var o = {};

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function() {
                o = JSON.parse(body);

                if('success' in o && o.success === false){
                    //send error info with reject
                    if(self.pendingVertices && !!self.pendingVertices.length){
                        //This indicates that all new Vertices were created but failed to
                        //complete the rest of the tranasction so the new Vertices need deleted
                        rollbackVertices.call(self)
                            .then(function(result){
                                deferred.reject(result);
                            },function(error){
                                deferred.reject(error);
                            });
                    } else {
                        deferred.reject(o);
                    }
                } else {
                    // delete o.version;
                    // delete o.queryTime;
                    // delete o.txProcessed;

                    //This occurs after pendingVertices have been created
                    //and passed in to postData
                    if(!('results' in o) && self.pendingVertices && !!self.pendingVertices.length){
                        o.pendingVertices = [];
                        push.apply(o.pendingVertices, self.pendingVertices);
                        self.pendingVertices.length = 0;
                    }

                    if('tx' in data){
                        data.tx.length = 0;
                    }

                    deferred.resolve(o);
                }
            });
        });

        req.on('error', function(e) {
            console.error('problem with request: ' + e.message);
            deferred.reject(e);
        });

        // write data to request body
        req.write(payload);
        req.end();

        return deferred.promise;
    }


    Trxn.prototype.addVertex = cud('create', 'vertex');

    Trxn.prototype.addEdge = cud('create', 'edge');

    Trxn.prototype.removeVertex = cud('delete', 'vertex');

    Trxn.prototype.removeEdge = cud('delete', 'edge');

    Trxn.prototype.updateVertex = cud('update', 'vertex');

    Trxn.prototype.updateEdge = cud('update', 'edge');

    return Trxn;
})();
