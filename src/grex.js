;(function(global) {
    "use strict";
    var q = require('q');
    var http = require('http');

    var toString = Object.prototype.toString,
        push = Array.prototype.push;

    var pathBase = '/graphs/';
    var gremlinExt = '/tp/gremlin?script=';
    var batchExt = '/tp/batch/tx';
    var newVertex = '/vertices';
    var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt|decr|incr|notin|in)$|^Contains\.(IN|NOT_IN)$|^g\.|^Vertex(?=\.class\b)|^Edge(?=\.class\b)/;
    var closureRegex = /^\{.*\}$/;

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
        'map': 'map',
        'date': 'l',
        'unknown': 's' //this is to allow for a bug - to be removed once resolved
    };

    function isRegexId(id) {
        return !!this.OPTS.idRegex && isString(id) && this.OPTS.idRegex.test(id);
    };

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

    //obj1 over writes obj2
    function merge(obj1, obj2) {
        for(var p in obj2) {
            try  {
                if(obj1.hasOwnProperty(p)) {
                    obj1[p] = merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    };
   
    function qryMain(method, reset){
        return function(){
            var self = this,
                gremlin = reset ? new Gremlin(this) : self._buildGremlin(self.params),
                args = '',
                appendArg = '';

            //cater for select array parameters
            if(method == 'select'){
                args = arguments;
                gremlin.params += '.' + method + buildArgs.call(self, args, true);
            } else {
                args = isArray(arguments[0]) ? arguments[0] : arguments;
                //cater for idx param 2
                if(method == 'idx' && args.length > 1){
                    for (var k in args[1]){
                        appendArg = k + ":";
                        appendArg += parseArgs.call(self, args[1][k])
                    }
                    appendArg = "[["+ appendArg + "]]";
                    args.length = 1;
                }
                gremlin.params += '.' + method + buildArgs.call(self, args);    
            }
            gremlin.params += appendArg;
            return gremlin;
        }
    }

    function parseArgs(val) {
        if(val === null) {
            return 'null';
        }
        //check to see if the arg is referencing the graph ie. g.v(1)
        if(isObject(val) && val.hasOwnProperty('params') && isGraphReference(val.params)){
            return val.params.toString();
        }
        if(isGraphReference(val)) {
            return val.toString();
        }
        //Cater for ids that are not numbers but pass parseFloat test
        if(isRegexId.call(this, val) || isNaN(parseFloat(val))) {
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
            var self = this,
                gremlin = self._buildGremlin(this.params),
                args = [],
                isArr = isArray(arguments[0]),
                argsLen = isArr ? arguments[0].length : arguments.length;

            gremlin.params += "." + method + "("
            for (var _i = 0; _i < argsLen; _i++) {
                gremlin.params += isArr ? arguments[0][_i].params || parseArgs.call(self, arguments[0][_i]) : arguments[_i].params || parseArgs.call(self, arguments[_i]);
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
            var self = this,
                gremlin = this._buildGremlin(this.params),
                param = '';

            if(isArray(arguments[0])){
                for (var _i = 0, argsLen = arguments[0].length; _i < argsLen; _i++) {
                    param += arguments[0][_i].params;
                    param += ",";
                }
                gremlin.params += "." + method + "([" + param + "])";
            } else {
                gremlin.params += "." + method + buildArgs.call(self, arguments[0]);
            }
            return gremlin;
        }
    }

    function buildArgs(array, retainArray) {
        var self = this,
            argList = '',
            append = '',
            jsonString = '';
            
        for (var _i = 0, l = array.length; _i < l; _i++) {
            if(isClosure(array[_i])){
                append += array[_i];
            } else if (isObject(array[_i]) && array[_i].hasOwnProperty('verbatim')) {
                argList += array[_i].verbatim + ","; 
            } else if (isObject(array[_i]) && !(array[_i].hasOwnProperty('params') && isGraphReference(array[_i].params))) {
                jsonString = JSON.stringify(array[_i]);
                jsonString = jsonString.replace('{', '[');
                argList += jsonString.replace('}', ']') + ",";
            } else if(retainArray && isArray(array[_i])) {
                argList += "[" + parseArgs.call(self, array[_i]) + "],";
            } else {
                argList += parseArgs.call(self, array[_i]) + ",";
            }
        }
        argList = argList.slice(0, -1);
        return '(' + argList + ')' + append;
    }

    var Trxn = (function () {

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
                            } else {
                                tempObj[k] = '(map,(' + addTypes(obj[k], typeDef[k], true) + '))'; 
                            }
                        } else if ((k in typeDef) && isArray(typeDef[k])) {
                            if(embedded){
                                tempStr += '(list,(' + addTypes(obj[k], typeDef[k], true, true) + '))';
                            } else {
                                tempObj[k] = '(list,(' + addTypes(obj[k], typeDef[k], true, true) + '))'; 
                            }
                        } else {
                            if(embedded){
                                if (list) {
                                    if (k in typeDef) {
                                        idx = k;
                                        tempStr += '(' + typeHash[typeDef[idx]] + ',' + obj[k] + ')';
                                        tempStr = tempStr.replace(')(', '),(');
                                    } else {
                                        idx = typeDef.length - 1;
                                        if (isObject(typeDef[idx])) {
                                            tempStr += ',(map,(' + addTypes(obj[k], typeDef[idx], true) + '))';    
                                        } else if (isArray(typeDef[idx])){
                                            tempStr += ',(list,(' + addTypes(obj[k], typeDef[idx], true, true) + '))';
                                        } else {
                                          tempStr += '(' + typeHash[typeDef[idx]] + ',' + obj[k] + ')';
                                          tempStr = tempStr.replace(')(', '),(');
                                        };
                                    };
                                } else {
                                    if (k in typeDef) {
                                        tempStr += k + '=(' + typeHash[typeDef[k]] + ',' + obj[k] + ')';
                                        tempStr = tempStr.replace(')(', '),(');    
                                    } else {
                                        tempObj[k] = obj[k];
                                    };
                                };
                            } else {
                                if (k in typeDef) {
                                    tempObj[k] = '(' + typeHash[typeDef[k]] + ',' + obj[k] + ')';
                                } else {
                                    tempObj[k] = obj[k];
                                };
                            }
                        }
                    } else {
                        tempObj[k] = obj[k];
                    }                    
                }
            }
            tempStr = tempStr.replace(')(', '),(');
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
                    };
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
        function Gremlin(gRex/*options*//*, params*/) {
            this.gRex = gRex;
            this.OPTS = gRex.OPTS;//options;
            this.params = 'g';//params ? params : 'g';
        }
      
        function get() {
            return function(success, error){
                return getData.call(this).then(success, error);
            }
        }

        function getData() {
            var self = this;
            var deferred = q.defer();
            var options = {
                'host': this.OPTS.host,
                'port': this.OPTS.port,
                'path': pathBase + this.OPTS.graph + gremlinExt + encodeURIComponent(this.params) + '&rexster.showTypes=true',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                'method': 'GET'
            };

            http.get(options, function(res) {
                var body = '';
                var typeMap = {};
                var tempObj = {};
                var returnObj = {};
                var resultObj = { results: [], typeMap: {} };
                var n;
                res.on('data', function(results) {
                    body += results;
                });

                res.on('end', function() {
                    deferred.resolve(transformResults.call(self.gRex, JSON.parse(body).results));
                });

            }).on('error', function(e) {
                deferred.reject(e);
            });
            
            return deferred.promise;
        }

        function createTypeDef(obj){
            var tempObj = {},
                tempTypeObj = {},
                tempResultObj = {},
                tempTypeArr = [],
                tempResultArr = [],
                len = 0, rest = 1,
                returnObj = {typeDef:{}, result: {}};

            if (isArray(obj)) { 
                len = obj.length;
                for (var i = 0; i < len; i++) {
                    if (obj[i].type == 'map' || obj[i].type == 'list') {
                        tempObj = createTypeDef(obj[i].value);
                        tempTypeArr[i] = tempObj.typeDef;
                        tempResultArr[i] = tempObj.result;
                    } else {
                        //determine if the array has same types
                        //then only show the type upto that index
                        if(i > 0){
                            //TODO: May need to compare Object Types 
                            //unable to do so at this time due to a bug
                            if (obj[i].type !== obj[i - 1].type) {
                                rest = i + 1;
                            };
                        }
                        tempTypeArr.push(obj[i].type);
                        tempResultArr.push(obj[i].value);    
                    }
                };
                tempTypeArr.length = rest;
                returnObj.typeDef = tempTypeArr;
                returnObj.result = tempResultArr;
            } else {
                for(var k in obj){
                    if (obj.hasOwnProperty(k)) {
                        if(obj[k].type == 'map' || obj[k].type == 'list'){
                            tempObj = createTypeDef(obj[k].value);
                            tempTypeObj[k] = tempObj.typeDef;
                            tempResultObj[k] = tempObj.result;
                        } else {
                            tempTypeObj[k] = obj[k].type;
                            tempResultObj[k] = obj[k].value;
                        }
                    };
                }
                returnObj.typeDef = tempTypeObj;
                returnObj.result = tempResultObj;

            };
            return returnObj;
        }

        function transformResults(results){
            var typeMap = {};
            var typeObj, tempObj, returnObj;
            var result = { success: true, results: [], typeMap: {} };
            var n, l = results ? results.length : 0;
            
            for(n = 0; n<l; n++){
                tempObj = results[n];
                if (isObject(tempObj)) {
                    returnObj = {};
                    typeObj = {};
                    for(var k in tempObj){
                        if (tempObj.hasOwnProperty(k)) {
                            if (isObject(tempObj[k]) && 'type' in tempObj[k]) {
                                if(!!typeMap[k] && typeMap[k] != tempObj[k].type){
                                    if(!result.typeMapErr){
                                        result.typeMapErr = {};
                                    }
                                    console.error('_id:' + tempObj._id + ' => {' + k + ':' + tempObj[k].type + '}');
                                    //only capture the first error
                                    if(!(k in result.typeMapErr)){
                                        result.typeMapErr[k] = typeMap[k] + ' <=> ' + tempObj[k].type;    
                                    }
                                }
                                if (tempObj[k].type == 'map' || tempObj[k].type == 'list') {
                                    //build recursive func to build object
                                    typeObj = createTypeDef(tempObj[k].value);
                                    typeMap[k] = typeObj.typeDef; 
                                    returnObj[k] = typeObj.result;
                                } else {
                                    typeMap[k] = tempObj[k].type;
                                    returnObj[k] = tempObj[k].value;
                                };
                            } else {
                                returnObj[k] = tempObj[k];
                            };
                        };
                    }
                    result.results.push(returnObj);
                } else {
                    result.results.push(tempObj);
                }
            }

            result.typeMap = typeMap;
            //This will preserve any local TypeDefs
            this.typeMap = merge(this.typeMap, typeMap);
            return result;
        }

        Gremlin.prototype = {
            _buildGremlin: function (qryString){
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
            orderMap: qryMain('orderMap'),
            
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
            keys: qryMain('keys'),
            remove: qryMain('remove'),
            values: qryMain('values'),
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
            
        function gRex(options){
            var self = this;
            //default options
            this.OPTS = {
                'host': 'localhost',
                'port': 8182,
                'graph': 'tinkergraph',
                'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
            };

            this.typeMap = {};

            if(options){
                this.setOptions(options);
            }

            this.V = qryMain('V', true);
            this._ = qryMain('_', true);
            this.E = qryMain('E', true);
            this.V =  qryMain('V', true);

            //Methods
            this.e = qryMain('e', true);
            this.idx = qryMain('idx', true);
            this.v = qryMain('v', true);

            //Indexing
            this.createIndex = qryMain('createIndex', true);
            this.createKeyIndex = qryMain('createKeyIndex', true);
            this.getIndices =  qryMain('getIndices', true);
            this.getIndexedKeys =  qryMain('getIndexedKeys', true);
            this.getIndex =  qryMain('getIndex', true);
            this.dropIndex = qryMain('dropIndex', true);
            this.dropKeyIndex = qryMain('dropKeyIndex', true);

            //CUD
            // exports.addVertex = cud('create', 'vertex');
            // exports.addEdge = cud('create', 'edge');
            // exports.removeVertex = cud('delete', 'vertex');
            // exports.removeEdge = cud('delete', 'edge');
            // exports.updateVertex = cud('update', 'vertex');
            // exports.updateEdge = cud('update', 'edge');

            this.clear =  qryMain('clear', true);
            this.shutdown = qryMain('shutdown', true);
            this.getFeatures = qryMain('getFeatures', true);

            this.connect = function(){
                return q.fcall(function() {
                    return self;
                });
            };
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

        gRex.prototype.begin = function (typeMap){
            return new Trxn(this.OPTS, typeMap ? merge(typeMap, this.typeMap) : this.typeMap);
        }

        return gRex;
    })();

    var grex = function(options){
        var db = new gRex(options);
        return db.connect();
    };

    // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {        
        define({ connect: grex });
    }
    // check for `exports` after `define` in case a build optimizer adds an `exports` object
    else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        exports.connect = grex;
    }
    else {
        //browser
        global.gRex = { connect: grex };
    }

})(this);
