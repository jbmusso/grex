"use strict"
var q = require('q');
var http = require('http');

var toString = Object.prototype.toString,
    push = Array.prototype.push;

var pathBase = '/graphs/';
var gremlinExt = '/tp/gremlin?script=';
var batchExt = '/tp/batch/tx';
var newVertex = '/vertices';
var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt)$|^g\.|^Vertex(?=\.class\b)|^Edge(?=\.class\b)/;
var closureRegex = /^\{.*\}$/;

function isIdString(id) {

    //TODO: Check this
    return !!OPTS.idRegex && isString(id) && OPTS.idRegex.test(id);
}

function isString(o) {
    return toString.call(o) === '[object String]';
}

function isGraphReference (val) {
    return isString(val) && graphRegex.test(val);
}

function isObject(o) {
    return toString.call(o) === '[object Object]';
}

function isClosure(val) {
    return isString(val) && closureRegex.test(val);   
}

function isArray(o) {
    return toString.call(o) === '[object Array]';
}

function qryMain(method, options, createNew){
    return function(){
        var gremlin,
            args = isArray(arguments[0]) ? arguments[0] : arguments,
            appendArg = '';

        gremlin = createNew ? new Gremlin(options) : this._buildGremlin(this.params);
                 
        //cater for idx param 2
        if(method == 'idx' && args.length > 1){
            for (var k in args[1]){
                appendArg = k + ":";
                appendArg += parseArgs(args[1][k])
            }
            appendArg = "[["+ appendArg + "]]";
            args.length = 1;
        }
        gremlin.params += '.' + method + args(args);
        gremlin.params += appendArg;
        return gremlin;
    }
}

function parseArgs(val) {
    //check to see if the arg is referencing the graph ie. g.v(1)
    if(isObject(val) && val.hasOwnProperty('params') && isGraphReference(val.params)){
        return val.params.toString();
    }
    if(isGraphReference(val)) {
        return val.toString();
    }
    //Cater for ids that are not numbers but pass parseFloat test
    if(isIdString(val) || isNaN(parseFloat(val))) {
        return "'" + val + "'";
    }
    if(!isNaN(parseFloat(val))) {
         return val.toString();    
    }
    return val;
}


//[i] => index & [1..2] => range
//Do not pass in method name, just string arg
function qryIndex(){
    return function(arg) {
        var gremlin = this._buildGremlin(this.params);
        gremlin.params += '['+ arg.toString() + ']';
        return gremlin;
    }
}

//and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
function qryPipes(method){
    return function() {
        var gremlin = this._buildGremlin(this.params),
            args = [],
            isArray = isArray(arguments[0]),
            argsLen = isArray ? arguments[0].length : arguments.length;

        gremlin.params += "." + method + "("
        for (var _i = 0; _i < argsLen; _i++) {
            gremlin.params += isArray ? arguments[0][_i].params || parseArgs(arguments[0][_i]) : arguments[_i].params || parseArgs(arguments[_i]);
            gremlin.params += ",";
        }
        gremlin.params = gremlin.params.slice(0, -1);
        gremlin.params += ")";
        return gremlin;
    }
}

//retain & except => g.V().retain([g.v(1), g.v(2), g.v(3)])
function qryCollection(method){
    return function() {
        var gremlin = this._buildGremlin(this.params),
            args = [];

        gremlin.params += "." + method + "(["
        for (var _i = 0, argsLen = arguments[0].length; _i < argsLen; _i++) {
            gremlin.params += arguments[0][_i].params;
            gremlin.params += ",";
        }
        gremlin.params = gremlin.params.slice(0, -1);
        gremlin.params += "])";
        return gremlin;
    }
}

function args(array) {
    var argList = '',
        append = '',
        jsonString = '';
        
    for (var _i = 0, l = array.length; _i < l; _i++) {
        if(isClosure(array[_i])){
            append += array[_i];
        } else if (isObject(array[_i]) && !(array[_i].hasOwnProperty('params') && isGraphReference(array[_i].params))) {
            jsonString = JSON.stringify(array[_i]);
            jsonString = jsonString.replace('{', '[');
            argList += jsonString.replace('}', ']') + ",";
        } else {
            argList += parseArgs(array[_i]) + ",";
        }
    }
    argList = argList.slice(0, -1);
    return '(' + argList + ')' + append;
}

var Trxn = (function () {

    function Trxn(options) {
        this.OPTS = options;
        this.txArray = [];
        this.newVertices = [];
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
                push.call(this.txArray, o);    
            };
            return o;
        }
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
        };
        //This indicates that nothing was able to be created as there
        //is no need to create a tranasction to delete the any vertices as there
        //were no new vertices successfully created as part of this Transaction
        self.newVertices.length = 0;
        if(!self.txArray.length){
            return q.fcall(function () {
                return errObj.message = "Could not complete transaction. Transaction has been rolled back.";
            });
        }

        //There were some vertices created which now need to be deleted from
        //the database. On success throw error to indicate transaction was
        //unsuccessful. On fail throw error to indicate that transaction was
        //unsuccessful and that the new vertices created were unable to be removed
        //from the database and need to be handled manually.
        return postData.call(self, batchExt, { tx: self.txArray })
            .then(function(success){
                return errObj.message = "Could not complete transaction. Transaction has been rolled back.";
            }, function(fail){
                errObj.message =  "Could not complete transaction. Unable to roll back newly created vertices.";
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
                    //Need to see why no creating promised
                    //just changed 
                    promises.push(postData.call(self, newVertex, self.newVertices[i]));
                };
                return q.all(promises).then(function(result){
                    var inError = false;
                    //Update the _id for the created Vertices
                    //this filters through the object reference
                    var resultLen = result.length;
                    for (var j = 0; j < resultLen; j++) {
                        if('results' in result[j] && '_id' in result[j].results){
                            self.newVertices[j]._id = result[j].results._id;
                        } else {
                            inError = true;
                        }
                    };

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
                            }; 
                            if (isObject(self.txArray[k]._outV)) {
                                self.txArray[k]._outV = self.txArray[k]._outV._id;
                            };    
                        }                        
                    };
                    return postData.call(self, batchExt, { tx: self.txArray });
                }, function(err){
                    console.error(err);
                }); 
            } else {
                for (var k = 0; k < txLen; k++) {
                    if(self.txArray[k]._type == 'edge' && self.txArray[k]._action == 'create'){
                        if (isObject(self.txArray[k]._inV)) {
                            self.txArray[k]._inV = self.txArray[k]._inV._id;
                        }; 
                        if (isObject(this.txArray[k]._outV)) {
                            self.txArray[k]._outV = self.txArray[k]._outV._id;
                        };    
                    }                        
                };
                return postData.call(self, batchExt, { tx: self.txArray });
            }
        }
    }

    function postData(urlPath, data){
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
        options.path += urlPath;
        
        var req = http.request(options, function(res) {
            var body = '';
            var o = {};

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function() {
                o = JSON.parse(body);
                if('success' in o && o.success == false){
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
        });

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
    }
    return Trxn;
})();

var Gremlin = (function () {
    function Gremlin(options) {
        this.OPTS = options;
        this.params = 'g';    
    }
  
    function get() {
        return function(success, error){
            return getData.call(this).then(success, error);
        }
    }

    function getData() {
        var deferred = q.defer();
        var options = {
            'host': this.OPTS.host,
            'port': this.OPTS.port,
            'path': pathBase + this.OPTS.graph + gremlinExt + encodeURIComponent(this.params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'method': 'GET'
        };

        http.get(options, function(res) {
            var body = '';
            var o = {};
            res.on('data', function(results) {
                body += results;
            });

            res.on('end', function() {
                o = JSON.parse(body);
                delete o.version;
                delete o.queryTime;
                deferred.resolve(o);
            });
        }).on('error', function(e) {
            deferred.reject(e);
        });
        
        return deferred.promise;
    }

    Gremlin.prototype = {
        _buildGremlin: function (qryString){
            //console.log(this);
            this.params = qryString;
            return this;
        },
        /*** Transform ***/
        both: qryMain('both'),
        bothE: qryMain('bothE'),
        bothV: qryMain('bothV'),
        cap: qryMain('cap'),
        gather: qryMain('gather'),
        id: qryMain('id'),
        'in': qryMain('in'),
        inE: qryMain('inE'),
        inV: qryMain('inV'),
        property: qryMain('property'),
        label: qryMain('label'),
        map: qryMain('map'),
        memoize: qryMain('memoize'),
        order: qryMain('order'),
        out: qryMain('out'),
        outE: qryMain('outE'),
        outV: qryMain('outV'),
        path: qryMain('path'),
        scatter: qryMain('scatter'),
        select: qryMain('select'),
        transform: qryMain('transform'),
        
        /*** Filter ***/
        index: qryIndex(), //index(i)
        range: qryIndex(), //range('[i..j]')
        and:  qryPipes('and'),
        back:  qryMain('back'),
        dedup: qryMain('dedup'),
        except: qryCollection('except'),
        filter: qryMain('filter'),
        has: qryMain('has'),
        hasNot: qryMain('hasNot'),
        interval: qryMain('interval'),
        or: qryPipes('or'),
        random: qryMain('random'),
        retain: qryCollection('retain'),
        simplePath: qryMain('simplePath'),
        
        /*** Side Effect ***/ 
        // aggregate //Not implemented
        as: qryMain('as'),
        groupBy: qryMain('groupBy'),
        groupCount: qryMain('groupCount'), //Not Fully Implemented ??
        optional: qryMain('optional'),
        sideEffect: qryMain('sideEffect'),

        linkBoth: qryMain('linkBoth'),
        linkIn: qryMain('linkIn'),
        linkOut: qryMain('linkOut'),
        // store //Not implemented
        // table //Not implemented
        // tree //Not implemented

        /*** Branch ***/
        copySplit: qryPipes('copySplit'),
        exhaustMerge: qryMain('exhaustMerge'),
        fairMerge: qryMain('fairMerge'),
        ifThenElse: qryMain('ifThenElse'), //g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
        loop: qryMain('loop'),

        /*** Methods ***/
        //fill //Not implemented
        count: qryMain('count'),
        iterate: qryMain('iterate'),
        next: qryMain('next'),
        toList: qryMain('toList'),
        put: qryPipes('put'),

        getPropertyKeys: qryMain('getPropertyKeys'),
        setProperty: qryMain('setProperty'),
        getProperty: qryMain('getProperty'),

        /*** http ***/
        then: get(),

    }
    return Gremlin;
})();

var gRex = (function(){
        
    function gRex(){
    // //default options
    // this.OPTS = {
    //     'host': 'localhost',
    //     'port': 8182,
    //     'graph': 'tinkergraph',
    //     'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
    // };

        this.OPTS = {
            'host': 'localhost',
            'port': 8182,
            'graph': 'tinkerTest',
            'idRegex': /^[0-9]+:[0-9]+$/
        };

        this.V = qryMain('V', this.OPTS, true);
        this._ = qryMain('_', this.OPTS, true);
        this.E = qryMain('E', this.OPTS, true);
        this.V =  qryMain('V', this.OPTS, true);

        //Methods
        this.e = qryMain('e', this.OPTS, true);
        this.idx = qryMain('idx', this.OPTS, true);
        this.v = qryMain('v', this.OPTS, true);

        //Indexing
        this.createIndex = qryMain('createIndex');
        this.createKeyIndex = qryMain('createKeyIndex');
        this.getIndices =  qryMain('getIndices');
        this.getIndexedKeys =  qryMain('getIndexedKeys');
        this.getIndex =  qryMain('getIndex');
        this.dropIndex = qryMain('dropIndex');
        this.dropKeyIndex = qryMain('dropKeyIndex');

        //CUD
        // exports.addVertex = _cud('create', 'vertex');
        // exports.addEdge = _cud('create', 'edge');
        // exports.removeVertex = _cud('delete', 'vertex');
        // exports.removeEdge = _cud('delete', 'edge');
        // exports.updateVertex = _cud('update', 'vertex');
        // exports.updateEdge = _cud('update', 'edge');

        this.clear =  qryMain('clear');
        this.shutdown =  qryMain('shutdown');
        this.getFeatures = qryMain('getFeatures');

    }

    gRex.prototype.setOptions = function (options){
        if(!!options){
            for (var k in options){
                if(options.hasOwnProperty(k)){
                    this.OPTS[k] = options[k];
                }
            }
        }
    }
    

    gRex.prototype.begin = function (){
        return new Trxn(this.OPTS);
    }

    return gRex;
})();
module.exports = gRex;
