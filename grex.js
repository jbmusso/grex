"use strict"
var q = require('q');
var http = require('http');

var toString = Object.prototype.toString,
    push = Array.prototype.push;
    
// //default options
// var OPTS = {
//     'host': 'localhost',
//     'port': 8182,
//     'graph': 'tinkergraph',
//     'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
// };

//default options
var OPTS = {
    'host': 'localhost',
    'port': 8182,
    'graph': 'tinkerTest',
    'idRegex': /^[0-9]+:[0-9]+$/
};

var _pathBase = '/graphs/';
var _gremlinExt = '/tp/gremlin?script=';
var _batchExt = '/tp/batch/tx';
var _newVertex = '/vertices';
var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt)$|^g\.|^Vertex(?=\.class\b)|^Edge(?=\.class\b)/;
var closureRegex = /^\{.*\}$/;

function gRex(qryString) {
    if(!!qryString){
        this.params = qryString;
    } else {
        this.params = 'g';    
    };

}

exports.setOptions= _setOptions();
exports._ = _qryMain('_', true);
exports.E = _qryMain('E', true); 
exports.V =  _qryMain('V', true); 

//Methods
exports.e = _qryMain('e', true); 
exports.idx = _qryMain('idx', true); 
exports.v = _qryMain('v', true); 

//Indexing
exports.createIndex = _qryMain('createIndex');
exports.createKeyIndex = _qryMain('createKeyIndex');
exports.getIndices =  _qryMain('getIndices');
exports.getIndexedKeys =  _qryMain('getIndexedKeys');
exports.getIndex =  _qryMain('getIndex');
exports.dropIndex = _qryMain('dropIndex');
exports.dropKeyIndex = _qryMain('dropKeyIndex');

//CUD
// exports.addVertex = _cud('create', 'vertex');
// exports.addEdge = _cud('create', 'edge');
// exports.removeVertex = _cud('delete', 'vertex');
// exports.removeEdge = _cud('delete', 'edge');
// exports.updateVertex = _cud('update', 'vertex');
// exports.updateEdge = _cud('update', 'edge');


exports.clear =  _qryMain('clear');
exports.shutdown =  _qryMain('shutdown');
exports.getFeatures = _qryMain('getFeatures');

exports.begin = _begin();

function _setOptions (){
    return function (options){
        if(!!options){
            for (var k in options){
                if(options.hasOwnProperty(k)){
                    OPTS[k] = options[k];
                }
            }
        }
    }
}

function _isIdString(id) {
    return !!OPTS.idRegex && _isString(id) && OPTS.idRegex.test(id);
}

function _isString(o) {
    return toString.call(o) === '[object String]';
}

function _isGraphReference (val) {
    return _isString(val) && graphRegex.test(val);
}

function _isObject(o) {
    return toString.call(o) === '[object Object]';
}

function _isClosure(val) {
    return _isString(val) && closureRegex.test(val);   
}

function _isArray(o) {
    return toString.call(o) === '[object Array]';
}

function _parseArgs(val) {
    //check to see if the arg is referencing the graph ie. g.v(1)
    if(_isObject(val) && val.hasOwnProperty('params') && _isGraphReference(val.params)){
        return val.params.toString();
    }
    if(_isGraphReference(val)) {
        return val.toString();
    }
    //Cater for ids that are not numbers but pass parseFloat test
    if(_isIdString(val) || isNaN(parseFloat(val))) {
        return "'" + val + "'";
    }
    if(!isNaN(parseFloat(val))) {
         return val.toString();    
    }
    return val;
}

function _qryMain(method, reset){
    return function(){
        var gremlin,
            args = _isArray(arguments[0]) ? arguments[0] : arguments,
            appendArg = '';

        gremlin = reset ? new gRex() : new gRex(this.params);
                 
        //cater for idx param 2
        if(method == 'idx' && args.length > 1){
            for (var k in args[1]){
                appendArg = k + ":";
                appendArg += _parseArgs(args[1][k])
            }
            appendArg = "[["+ appendArg + "]]";
            args.length = 1;
        }
        gremlin.params += '.' + method + _args(args);
        gremlin.params += appendArg;
        return gremlin;
    }
}

//[i] => index & [1..2] => range
//Do not pass in method name, just string arg
function _qryIndex(){
    return function(arg) {
        var gremlin = new gRex(this.params);
        gremlin.params += '['+ arg.toString() + ']';
        return gremlin;
    }
}

//and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
function _qryPipes(method){
    return function() {
        var gremlin = new gRex(this.params),
            args = [],
            isArray = _isArray(arguments[0]),
            argsLen = isArray ? arguments[0].length : arguments.length;

        gremlin.params += "." + method + "("
        for (var _i = 0; _i < argsLen; _i++) {
            gremlin.params += isArray ? arguments[0][_i].params || _parseArgs(arguments[0][_i]) : arguments[_i].params || _parseArgs(arguments[_i]);
            gremlin.params += ",";
        }
        gremlin.params = gremlin.params.slice(0, -1);
        gremlin.params += ")";
        return gremlin;
    }
}

//retain & except => g.V().retain([g.v(1), g.v(2), g.v(3)])
function _qryCollection(method){
    return function() {
        var gremlin = new gRex(this.params),
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

function _args(array) {
    var argList = '',
        append = '',
        jsonString = '';
        
    for (var _i = 0, l = array.length; _i < l; _i++) {
        if(_isClosure(array[_i])){
            append += array[_i];
        } else if (_isObject(array[_i]) && array[_i].hasOwnProperty('verbatim')) {
            argList += array[_i].verbatim + ","; 
        } else if (_isObject(array[_i]) && !(array[_i].hasOwnProperty('params') && _isGraphReference(array[_i].params))) {
            jsonString = JSON.stringify(array[_i]);
            jsonString = jsonString.replace('{', '[');
            argList += jsonString.replace('}', ']') + ",";
        } else {
            argList += _parseArgs(array[_i]) + ",";
        }
    }
    argList = argList.slice(0, -1);
    return '(' + argList + ')' + append;
}

function _cud(action, type) {
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
                    o = _isObject(arguments[argLen - 1]) ? arguments[argLen - 1] : {};
                    if (argLen == 5 || (argLen == 4 && !_isObject(o))) {
                        i = 1;
                        o._id = arguments[0];
                    }
                    o._outV = arguments[0 + i];
                    o._inV = arguments[1 + i];
                    o._label = arguments[2 + i];
                } else {
                    if (_isObject(arguments[0])) {
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
            if (action == 'update') {
              o = _docWithTypes(o);
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

function Trxn(){
    this.txArray = [];
    this.newVertices = [];
}

Trxn.prototype = {
    addVertex: _cud('create', 'vertex'),
    addEdge: _cud('create', 'edge'),
    removeVertex: _cud('delete', 'vertex'),
    removeEdge: _cud('delete', 'edge'),
    updateVertex: _cud('update', 'vertex'),
    updateEdge: _cud('update', 'edge'),
    commit: _post()
};

function _begin(){
    return function(){
        return new Trxn();
    }
}

//returns an error Object
function _rollbackVertices(){
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
    return postData.call(self, _batchExt, { tx: self.txArray })
        .then(function(success){
            return errObj.message = "Could not complete transaction. Transaction has been rolled back.";
        }, function(fail){
            errObj.message =  "Could not complete transaction. Unable to roll back newly created vertices.";
            //errObj.ids = [];
            errObj.ids = self.txArray.map(function(item){
                return item._id;
            });
            self.txArray.length = 0;
            return errObj;
        }); 
}

//function converts json document to a stringed version with types
function _docWithTypes(doc, offRoot) {
  if (doc === undefined)
    return doc;
  if (doc === null) {
    if (offRoot)
      return "(null,null)";
    return doc;
  }
  try {
    var d = {};
    var self = this;
    if (Array.isArray(doc)) {
      var out = offRoot ? ['(list,('] : [];
      var len = doc.length;
      for (var i = 0; i < len; i++) {
        var item = doc[i];
        out.push(_docWithTypes(item, true));
        if (offRoot)
          out.push(',');
      }
      if (offRoot)
        out.splice(out.length - 1, 1, '))');
      d = out.join('');
    } else if (typeof doc === 'object') {
      if (doc.constructor === Date) {
        d = '(long,' + doc.getTime().toString() + ')';
      } else {
        var out = offRoot ? [] : null;
        var keys = Object.keys(doc);
        var len = keys.length;
        for (var i = 0; i < len; i++) {
          var e = keys[i];
          if (/^_id$|^_type$|^_action$/.test(e) && !offRoot) {
            d[e] = doc[e];
          } else {
            var v = doc[e];
            if (offRoot) {
              out.push(i + '=' + self.docWithTypes(v, true));
            } else {
              d[e] = _docWithTypes(v, true);
            }
          }
        }
        if (offRoot)
          d[e] = '(map,(' + out.join(',') + '))';
      }
    } else {
      if (doc instanceof Boolean || typeof doc === 'boolean') {
        d = doc ? "(b,true)" : "(b,false)";
      } else if (doc instanceof String || typeof doc === 'string') {
        d = doc.toString();
      } else if (doc instanceof Number || typeof doc === 'number') {
        try {
          d = '(l,' + parseInt(doc) + ')';
        }
        catch (ee) {
          try {
            d = '(d,' + parseFloat(doc) + ')';
          }
          catch (ee2) {
            d = doc.toString();
          }
        }
      } else {
        d = doc.toString();
      }
    }
    return d;
  }
  catch (e) {
    console.log(doc, e);
  }
}

gRex.prototype = {
    
    /*** Transform ***/
    both: _qryMain('both'),
    bothE: _qryMain('bothE'),
    bothV: _qryMain('bothV'),
    cap: _qryMain('cap'),
    gather: _qryMain('gather'),
    id: _qryMain('id'),
    'in': _qryMain('in'),
    inE: _qryMain('inE'),
    inV: _qryMain('inV'),
    property: _qryMain('property'),
    label: _qryMain('label'),
    map: _qryMain('map'),
    memoize: _qryMain('memoize'),
    order: _qryMain('order'),
    out: _qryMain('out'),
    outE: _qryMain('outE'),
    outV: _qryMain('outV'),
    path: _qryMain('path'),
    scatter: _qryMain('scatter'),
    select: _qryMain('select'),
    transform: _qryMain('transform'),
    
    /*** Filter ***/
    index: _qryIndex(), //index(i)
    range: _qryIndex(), //range('[i..j]')
    and:  _qryPipes('and'),
    back:  _qryMain('back'),
    dedup: _qryMain('dedup'),
    except: _qryCollection('except'),
    filter: _qryMain('filter'),
    has: _qryMain('has'),
    hasNot: _qryMain('hasNot'),
    interval: _qryMain('interval'),
    or: _qryPipes('or'),
    random: _qryMain('random'),
    retain: _qryCollection('retain'),
    simplePath: _qryMain('simplePath'),
    
    /*** Side Effect ***/ 
    // aggregate //Not implemented
    as: _qryMain('as'),
    groupBy: _qryMain('groupBy'),
    groupCount: _qryMain('groupCount'), //Not Fully Implemented ??
    optional: _qryMain('optional'),
    sideEffect: _qryMain('sideEffect'),

    linkBoth: _qryMain('linkBoth'),
    linkIn: _qryMain('linkIn'),
    linkOut: _qryMain('linkOut'),
    // store //Not implemented
    // table //Not implemented
    // tree //Not implemented

    /*** Branch ***/
    copySplit: _qryPipes('copySplit'),
    exhaustMerge: _qryMain('exhaustMerge'),
    fairMerge: _qryMain('fairMerge'),
    ifThenElse: _qryMain('ifThenElse'), //g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
    loop: _qryMain('loop'),

    /*** Methods ***/
    //fill //Not implemented
    count: _qryMain('count'),
    iterate: _qryMain('iterate'),
    next: _qryMain('next'),
    toList: _qryMain('toList'),
    put: _qryPipes('put'),

    getPropertyKeys: _qryMain('getPropertyKeys'),
    setProperty: _qryMain('setProperty'),
    getProperty: _qryMain('getProperty'),

    /*** http ***/
    then: _get(),

}

function _get() {
    return function(success, error){
        return _getData.call(this).then(success, error);
    }
}

function _getData() {
    var deferred = q.defer();

    var options = {
        'host': OPTS.host,
        'port': OPTS.port,
        'path': _pathBase + OPTS.graph + _gremlinExt + encodeURIComponent(this.params),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        'method': 'GET'
    };

    http.get(options, function(res) {
        res.setEncoding('utf8');
        var body = '';
        var o = {};
        res.on('data', function(results) {
            body += results + "\n";
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

function _post() {
    return function() {
        var self = this;
        var promises = [];
        var newVerticesLen = self.newVertices.length;
        var txLen = this.txArray.length;

        if(!!newVerticesLen){
            for (var i = 0; i < newVerticesLen; i++) {
                //Need to see why no creating promised
                //just changed 
                promises.push(postData.call(self, _newVertex, self.newVertices[i]));
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
                    return _rollbackVertices.call(self)
                        .then(function(result){
                            throw result;
                        },function(error){
                            throw error;
                        });
                } 
                //Update any edges that may have referenced the newly created Vertices
                for (var k = 0; k < txLen; k++) {                    
                    if(self.txArray[k]._type == 'edge' && self.txArray[k]._action == 'create'){
                        if (_isObject(self.txArray[k]._inV)) {
                            self.txArray[k]._inV = self.txArray[k]._inV._id;
                        }; 
                        if (_isObject(self.txArray[k]._outV)) {
                            self.txArray[k]._outV = self.txArray[k]._outV._id;
                        };    
                    }                        
                };
                return postData.call(self, _batchExt, { tx: self.txArray });
            }, function(err){
                console.log(err);
            }); 
        } else {
            for (var k = 0; k < txLen; k++) {
                if(self.txArray[k]._type == 'edge' && self.txArray[k]._action == 'create'){
                    if (_isObject(self.txArray[k]._inV)) {
                        self.txArray[k]._inV = self.txArray[k]._inV._id;
                    }; 
                    if (_isObject(this.txArray[k]._outV)) {
                        self.txArray[k]._outV = self.txArray[k]._outV._id;
                    };    
                }                        
            };
            return postData.call(self, _batchExt, { tx: self.txArray });
        }
    }
}

function postData(urlPath, data){
    var self = this;
    var deferred = q.defer();
    var payload = JSON.stringify(data) || '{}';
    
    var options = {
        'host': OPTS.host,
        'port': OPTS.port,
        'path': _pathBase + OPTS.graph,
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
        res.setEncoding('utf8');

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
                    _rollbackVertices.call(self)
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