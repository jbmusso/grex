var request = require("request");
var q = require("q");
var _ = require("lodash");

var Utils = require("./utils");
var isClosure = Utils.isClosure;
var isGraphReference = Utils.isGraphReference;
var isRegexId = Utils.isRegexId;
var merge = Utils.merge;


function queryMain(method, reset){
    return function(){
        var gremlin = reset ? new Gremlin(this) : this._buildGremlin(this.params),
            args = '',
            appendArg = '';

        //cater for select array parameters
        if(method == 'select'){
            args = arguments;
            gremlin.params += '.' + method + buildArguments.call(this, args, true);
        } else {
            args = _.isArray(arguments[0]) ? arguments[0] : arguments;

            //cater for idx param 2
            if(method == 'idx' && args.length > 1){
                for (var k in args[1]){
                    appendArg = k + ":";
                    appendArg += parseArguments.call(this, args[1][k]);
                }

                appendArg = "[["+ appendArg + "]]";
                args.length = 1;
            }

            gremlin.params += '.' + method + buildArguments.call(this, args);
        }

        gremlin.params += appendArg;

        return gremlin;
    };
}

module.exports = queryMain;


//[i] => index & [1..2] => range
//Do not pass in method name, just string arg
function queryIndex(){
    return function(arg) {
        var gremlin = this._buildGremlin(this.params);
        gremlin.params += '['+ arg.toString() + ']';

        return gremlin;
    };
}


//and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
function queryPipes(method){
    return function() {
        var gremlin = this._buildGremlin(this.params),
            args = [],
            isArr = _.isArray(arguments[0]),
            argsLen = isArr ? arguments[0].length : arguments.length;

        gremlin.params += "." + method + "(";

        for (var _i = 0; _i < argsLen; _i++) {
            gremlin.params += isArr ? arguments[0][_i].params || parseArguments.call(this, arguments[0][_i]) : arguments[_i].params || parseArguments.call(this, arguments[_i]);
            gremlin.params += ",";
        }

        gremlin.params = gremlin.params.slice(0, -1);
        gremlin.params += ")";

        return gremlin;
    };
}

//retain & except => g.V().retain([g.v(1), g.v(2), g.v(3)])
function queryCollection(method){
    return function() {
        var gremlin = this._buildGremlin(this.params),
            param = '';

        if(_.isArray(arguments[0])){
            for (var _i = 0, argsLen = arguments[0].length; _i < argsLen; _i++) {
                param += arguments[0][_i].params;
                param += ",";
            }

            gremlin.params += "." + method + "([" + param + "])";
        } else {
            gremlin.params += "." + method + buildArguments.call(this, arguments[0]);
        }

        return gremlin;
    };
}

function buildArguments(array, retainArray) {
    var argList = '',
        append = '',
        jsonString = '';

    _.each(array, function(v) {
        if(isClosure(v)){
            append += v;
        } else if (_.isObject(v) && v.hasOwnProperty('verbatim')) {
            argList += v.verbatim + ",";
        } else if (_.isObject(v) && !(v.hasOwnProperty('params') && isGraphReference(v.params))) {
            jsonString = JSON.stringify(v);
            jsonString = jsonString.replace('{', '[');
            argList += jsonString.replace('}', ']') + ",";
        } else if(retainArray && _.isArray(v)) {
            argList += "[" + parseArguments.call(this, v) + "],";
        } else {
            argList += parseArguments.call(this, v) + ",";
        }
    }, this);

    argList = argList.slice(0, -1);

    return '(' + argList + ')' + append;
}

function parseArguments(val) {
    if(val === null) {
        return 'null';
    }

    //check to see if the arg is referencing the graph ie. g.v(1)
    if(_.isObject(val) && val.hasOwnProperty('params') && isGraphReference(val.params)){
        return val.params.toString();
    }

    if(isGraphReference(val)) {
        return val.toString();
    }

    //Cater for ids that are not numbers but pass parseFloat test
    if(isRegexId.call(this, val) || _.isNaN(parseFloat(val))) {
        return "'" + val + "'";
    }

    if(!_.isNaN(parseFloat(val))) {
         return val.toString();
    }

    return val;
}



var Gremlin = (function () {
    function Gremlin(gRex) {
        this.gRex = gRex;
        this.OPTS = gRex.OPTS;
        this.params = 'g';
    }

    Gremlin.prototype.get = function(callback) {
        return this.getData().then().nodeify(callback);
    };

    Gremlin.prototype.getData = function() {
        var deferred = q.defer();

        var uri = '/graphs/' + this.OPTS.graph + '/tp/gremlin?script=' + encodeURIComponent(this.params) + '&rexster.showTypes=true';
        var url = 'http://' + this.OPTS.host + ':' + this.OPTS.port + uri;

        var options = {
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        request.get(options, function(err, res, body) {
            if (err) {
                return deferred.reject(err);
            }

            var results = transformResults.call(this.gRex, JSON.parse(body).results);

            return deferred.resolve(results);
        }.bind(this));

        return deferred.promise;
    };

    function createTypeDefinition(obj){
        var tempObj = {},
            tempTypeObj = {},
            tempResultObj = {},
            tempTypeArr = [],
            tempResultArr = [],
            tempTypeArrLen = 0,
            len = 0,
            rest = 1,
            mergedObject = {},
            returnObj = {typeDef:{}, result: {}};

        if (_.isArray(obj)) {
            len = obj.length;

            for (var i = 0; i < len; i++) {
                if (obj[i].type == 'map' || obj[i].type == 'list') {
                    tempObj = createTypeDefinition(obj[i].value);
                    tempTypeArr[i] = tempObj.typeDef;
                    tempResultArr[i] = tempObj.result;
                } else {
                    tempTypeArr.push(obj[i].type);
                    tempResultArr.push(obj[i].value);
                }

                if(i > 0) {
                    //If type is map or list need to do deep compare
                    //to ascertain whether equal or not
                    //determine if the array has same types
                    //then only show the type upto that index
                    if (obj[i].type !== obj[i - 1].type) {
                        rest = i + 1;
                    }
                }
            }

            if(rest > 1 && _.isObject(tempTypeArr[rest])){
                //merge remaining objects
                tempTypeArrLen = tempTypeArr.length;
                mergedObject = tempTypeArr[rest - 1];

                for(var j = rest;j < tempTypeArrLen; j++){
                    mergedObject = merge(mergedObject, tempTypeArr[j]);
                }

                tempResultArr[rest - 1] = mergedObject;
            }

            tempTypeArr.length = rest;
            returnObj.typeDef = tempTypeArr;
            returnObj.result = tempResultArr;
        } else {

            _.forOwn(obj, function(v, k) {
                if (v.type == 'map' || v.type == 'list'){
                    tempObj = createTypeDefinition(v.value);
                    tempTypeObj[k] = tempObj.typeDef;
                    tempResultObj[k] = tempObj.result;
                } else {
                    tempTypeObj[k] = v.type;
                    tempResultObj[k] = v.value;
                }
            });

            returnObj.typeDef = tempTypeObj;
            returnObj.result = tempResultObj;

        }

        return returnObj;
    }

    function transformResults(results){
        var typeMap = {};
        var typeObj,
            graphElement,
            returnObj;

        var result = { success: true, results: [], typeMap: {} };

        _.each(results, function(graphElement) {
            if (_.isObject(graphElement)) {
                returnObj = {};
                typeObj = {};

                _.forOwn(graphElement, function(v, k) {
                    if (_.isObject(v) && 'type' in v) {
                        if(!!typeMap[k] && typeMap[k] != v.type){
                            if(!result.typeMapErr){
                                result.typeMapErr = {};
                            }

                            console.error('_id:' + graphElement._id + ' => {' + k + ':' + v.type + '}');

                            //only capture the first error
                            if(!(k in result.typeMapErr)){
                                result.typeMapErr[k] = typeMap[k] + ' <=> ' + v.type;
                            }
                        }

                        if (v.type == 'map' || v.type == 'list') {
                            //build recursive func to build object
                            typeObj = createTypeDefinition(v.value);
                            typeMap[k] = typeObj.typeDef;
                            returnObj[k] = typeObj.result;
                        } else {
                            typeMap[k] = v.type;
                            returnObj[k] = v.value;
                        }
                    } else {
                        returnObj[k] = v;
                    }
                });

                result.results.push(returnObj);
            } else {
                result.results.push(graphElement);
            }
        });

        result.typeMap = typeMap;
        //This will preserve any locally defined TypeDefs
        this.typeMap = merge(this.typeMap, typeMap);

        return result;
    }

    Gremlin.prototype._buildGremlin = function (queryString) {
        this.params = queryString;
        return this;
    };

    /*** Transform ***/
    Gremlin.prototype._ = queryMain('_');
    Gremlin.prototype.both = queryMain('both');
    Gremlin.prototype.bothE = queryMain('bothE');
    Gremlin.prototype.bothV = queryMain('bothV');
    Gremlin.prototype.cap = queryMain('cap');
    Gremlin.prototype.gather = queryMain('gather');
    Gremlin.prototype.id = queryMain('id');
    Gremlin.prototype.in = queryMain('in');
    Gremlin.prototype.inE = queryMain('inE');
    Gremlin.prototype.inV = queryMain('inV');
    Gremlin.prototype.property = queryMain('property');
    Gremlin.prototype.label = queryMain('label');
    Gremlin.prototype.map = queryMain('map');
    Gremlin.prototype.memoize = queryMain('memoize');
    Gremlin.prototype.order = queryMain('order');
    Gremlin.prototype.out = queryMain('out');
    Gremlin.prototype.outE = queryMain('outE');
    Gremlin.prototype.outV = queryMain('outV');
    Gremlin.prototype.path = queryMain('path');
    Gremlin.prototype.scatter = queryMain('scatter');
    Gremlin.prototype.select = queryMain('select');
    Gremlin.prototype.transform = queryMain('transform');
    Gremlin.prototype.orderMap = queryMain('orderMap');

    /*** Filter ***/
    Gremlin.prototype.index = queryIndex(), //index(i;
    Gremlin.prototype.range = queryIndex(), //range('[i..j]';
    Gremlin.prototype.and = queryPipes('and');
    Gremlin.prototype.back = queryMain('back');
    Gremlin.prototype.dedup = queryMain('dedup');
    Gremlin.prototype.except = queryCollection('except');
    Gremlin.prototype.filter = queryMain('filter');
    Gremlin.prototype.has = queryMain('has');
    Gremlin.prototype.hasNot = queryMain('hasNot');
    Gremlin.prototype.interval = queryMain('interval');
    Gremlin.prototype.or = queryPipes('or');
    Gremlin.prototype.random = queryMain('random');
    Gremlin.prototype.retain = queryCollection('retain');
    Gremlin.prototype.simplePath = queryMain('simplePath');

    /*** Side Effect ***/
    // Gremlin.prototype.aggregate //Not implemented
    Gremlin.prototype.as = queryMain('as');
    Gremlin.prototype.groupBy = queryMain('groupBy');
    Gremlin.prototype.groupCount = queryMain('groupCount'), //Not FullyImplemented ??;
    Gremlin.prototype.optional = queryMain('optional');
    Gremlin.prototype.sideEffect = queryMain('sideEffect');

    Gremlin.prototype.linkBoth = queryMain('linkBoth');
    Gremlin.prototype.linkIn = queryMain('linkIn');
    Gremlin.prototype.linkOut = queryMain('linkOut');
    // Gremlin.prototype.store //Not implemented
    // Gremlin.prototype.table //Not implemented
    // Gremlin.prototype.tree //Not implemented

    /*** Branch ***/
    Gremlin.prototype.copySplit = queryPipes('copySplit');
    Gremlin.prototype.exhaustMerge = queryMain('exhaustMerge');
    Gremlin.prototype.fairMerge = queryMain('fairMerge');
    Gremlin.prototype.ifThenElse = queryMain('ifThenElse'); //g.v(1).out()ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
    Gremlin.prototype.loop = queryMain('loop');

    /*** Methods ***/
    // Gremlin.prototype.fill //Not implemented
    Gremlin.prototype.count = queryMain('count');
    Gremlin.prototype.iterate = queryMain('iterate');
    Gremlin.prototype.next = queryMain('next');
    Gremlin.prototype.toList = queryMain('toList');
    Gremlin.prototype.keys = queryMain('keys');
    Gremlin.prototype.remove = queryMain('remove');
    Gremlin.prototype.values = queryMain('values');
    Gremlin.prototype.put = queryPipes('put');

    Gremlin.prototype.getPropertyKeys = queryMain('getPropertyKeys');
    Gremlin.prototype.setProperty = queryMain('setProperty');
    Gremlin.prototype.getProperty = queryMain('getProperty');

    //Titan specifics
    Gremlin.prototype.name = queryMain('name');
    Gremlin.prototype.dataType = queryMain('dataType');
    Gremlin.prototype.indexed = queryMain('indexed');
    Gremlin.prototype.unique = queryMain('unique');
    Gremlin.prototype.makePropertyKey = queryMain('makePropertyKey');
    Gremlin.prototype.group = queryMain('group');
    Gremlin.prototype.makeEdgeLabel = queryMain('makeEdgeLabel');
    Gremlin.prototype.query = queryMain('query');

    //Titan v0.4.0 specifics
    Gremlin.prototype.single = queryMain('single');
    Gremlin.prototype.list = queryMain('list');
    Gremlin.prototype.oneToMany = queryMain('oneToMany'), // replaces uniqueDirection.IN);
    Gremlin.prototype.manyToOne = queryMain('manyToOne'), // replaces uniqueDirection.OUT);
    Gremlin.prototype.oneToOne = queryMain('oneToOne'),   // replaces uniqueDirection.IN).unique(Direction.OUT);
    Gremlin.prototype.makeKey = queryMain('makeKey');
    Gremlin.prototype.makeLabel = queryMain('makeLabel');
    Gremlin.prototype.make = queryMain('make');
    Gremlin.prototype.sortKey = queryMain('sortKey');
    Gremlin.prototype.signature = queryMain('signature');
    Gremlin.prototype.unidirected = queryMain('unidirected');

    Gremlin.prototype.createKeyIndex = queryMain('createKeyIndex');
    Gremlin.prototype.getIndexes = queryMain('getIndexes');
    Gremlin.prototype.hasIndex = queryMain('hasIndex');

    return Gremlin;
})();
