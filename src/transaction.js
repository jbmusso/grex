var q = require("q"),
    http = require("http"),
    Utils = require("./utils");

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
        this.txArray = [];
        this.newVertices = [];
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
            var o = {},
                argLen = arguments.length,
                i = 0,
                addToTransaction = true;

            if (!!argLen) {
                if(action == 'delete'){
                    o._id = arguments[0];
                    if (argLen > 1) {
                        o._keys = arguments[1];
                    }
                } else {
                    if (type == 'edge') {
                        o = isObject(arguments[argLen - 1]) ? arguments[argLen - 1] : {};
                        if (argLen == 5 || (argLen == 4 && !isObject(o))) {
                            i = 1;
                            o._id = arguments[0];
                        }
                        o._outV = arguments[0 + i];
                        o._inV = arguments[1 + i];
                        o._label = arguments[2 + i];
                    } else {
                        if (isObject(arguments[0])) {
                            //create new Vertex
                            o = arguments[0];
                            push.call(this.newVertices, o);
                            addToTransaction = false;
                        } else {
                            if(argLen == 2){
                                o = arguments[1];
                            }
                            o._id = arguments[0];
                        }
                    }
                }
            //Allow for no args to be passed
            } else if (type == 'vertex') {
                push.call(this.newVertices, o);
                addToTransaction = false;
            }
            o._type = type;

            if (addToTransaction) {
                o._action = action;
                push.call(this.txArray, addTypes(o, this.typeMap));
            }

            return o;
        };
    }

    //returns an error Object
    function rollbackVertices(){
        var self = this;
        var errObj = { success: false, message : "" };
        //In Error because couldn't create new Vertices. Therefore,
        //roll back all other transactions
        console.error('problem with Transaction');
        self.txArray.length = 0;

        for (var i = self.newVertices.length - 1; i >= 0; i--) {
            //check if any vertices were created and create a Transaction
            //to delete them from the database
            if('_id' in self.newVertices[i]){
                self.removeVertex(self.newVertices[i]._id);
            }
        }

        //This indicates that nothing was able to be created as there
        //is no need to create a tranasction to delete the any vertices as there
        //were no new vertices successfully created as part of this Transaction
        self.newVertices.length = 0;
        if (!self.txArray.length){
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
        return postData.call(self, batchExt, { tx: self.txArray })
            .then(function(success){
                errObj.message = "Could not complete transaction. Transaction has been rolled back.";

                return errObj;
            }, function(fail){
                errObj.message = "Could not complete transaction. Unable to roll back newly created vertices.";
                errObj.ids = self.txArray.map(function(item){
                    return item._id;
                });
                self.txArray.length = 0;

                return errObj;
            });
    }

    function post() {
        return function() {
            var self = this;
            var promises = [];
            var newVerticesLen = self.newVertices.length;
            var txLen = this.txArray.length;

            if(!!newVerticesLen){
                for (var i = 0; i < newVerticesLen; i++) {
                    promises.push(postData.call(self, newVertex, addTypes(self.newVertices[i], self.typeMap),{'Content-Type':'application/vnd.rexster-typed-v1+json'}));
                }

                return q.all(promises).then(function(result){
                    var inError = false;
                    //Update the _id for the created Vertices
                    //this filters through the object reference
                    var resultLen = result.length;
                    for (var j = 0; j < resultLen; j++) {
                        if('results' in result[j] && '_id' in result[j].results){
                            for(var prop in result[j].results){
                                if(result[j].results.hasOwnProperty(prop)){
                                    self.newVertices[j][prop] = result[j].results[prop];
                                }
                            }
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
                    for (var k = 0; k < txLen; k++) {
                        if(self.txArray[k]._type == 'edge' && self.txArray[k]._action == 'create'){
                            if (isObject(self.txArray[k]._inV)) {
                                self.txArray[k]._inV = self.txArray[k]._inV._id;
                            }

                            if (isObject(self.txArray[k]._outV)) {
                                self.txArray[k]._outV = self.txArray[k]._outV._id;
                            }
                        }
                    }

                    return postData.call(self, batchExt, { tx: self.txArray });
                }, function(err){
                    console.error(err);
                });
            } else {
                for (var k = 0; k < txLen; k++) {
                    if(self.txArray[k]._type == 'edge' && self.txArray[k]._action == 'create'){
                        if (isObject(self.txArray[k]._inV)) {
                            self.txArray[k]._inV = self.txArray[k]._inV._id;
                        }

                        if (isObject(this.txArray[k]._outV)) {
                            self.txArray[k]._outV = self.txArray[k]._outV._id;
                        }
                    }
                }

                return postData.call(self, batchExt, { tx: self.txArray });
            }
        };
    }

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
                    if(self.newVertices && !!self.newVertices.length){
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
                    delete o.version;
                    delete o.queryTime;
                    delete o.txProcessed;
                    //This occurs after newVertices have been created
                    //and passed in to postData
                    if(!('results' in o) && self.newVertices && !!self.newVertices.length){
                        o.newVertices = [];
                        push.apply(o.newVertices, self.newVertices);
                        self.newVertices.length = 0;
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
        })

        // write data to request body
        req.write(payload);
        req.end();

        return deferred.promise;
    }

    Trxn.prototype = {
        addVertex: cud('create', 'vertex'),
        addEdge: cud('create', 'edge'),
        removeVertex: cud('delete', 'vertex'),
        removeEdge: cud('delete', 'edge'),
        updateVertex: cud('update', 'vertex'),
        updateEdge: cud('update', 'edge'),
        commit: post()
    };

    return Trxn;
})();
