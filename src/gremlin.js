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

    function get() {
        return function(callback){
            return getData.call(this).then().nodeify(callback);
        };
    }

    function getData() {
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
    }

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

    Gremlin.prototype = {
        _buildGremlin: function (queryString){
            this.params = queryString;
            return this;
        },

        /*** Transform ***/
        _: queryMain('_'),
        both: queryMain('both'),
        bothE: queryMain('bothE'),
        bothV: queryMain('bothV'),
        cap: queryMain('cap'),
        gather: queryMain('gather'),
        id: queryMain('id'),
        'in': queryMain('in'),
        inE: queryMain('inE'),
        inV: queryMain('inV'),
        property: queryMain('property'),
        label: queryMain('label'),
        map: queryMain('map'),
        memoize: queryMain('memoize'),
        order: queryMain('order'),
        out: queryMain('out'),
        outE: queryMain('outE'),
        outV: queryMain('outV'),
        path: queryMain('path'),
        scatter: queryMain('scatter'),
        select: queryMain('select'),
        transform: queryMain('transform'),
        orderMap: queryMain('orderMap'),

        /*** Filter ***/
        index: queryIndex(), //index(i)
        range: queryIndex(), //range('[i..j]')
        and:  queryPipes('and'),
        back:  queryMain('back'),
        dedup: queryMain('dedup'),
        except: queryCollection('except'),
        filter: queryMain('filter'),
        has: queryMain('has'),
        hasNot: queryMain('hasNot'),
        interval: queryMain('interval'),
        or: queryPipes('or'),
        random: queryMain('random'),
        retain: queryCollection('retain'),
        simplePath: queryMain('simplePath'),

        /*** Side Effect ***/
        // aggregate //Not implemented
        as: queryMain('as'),
        groupBy: queryMain('groupBy'),
        groupCount: queryMain('groupCount'), //Not Fully Implemented ??
        optional: queryMain('optional'),
        sideEffect: queryMain('sideEffect'),

        linkBoth: queryMain('linkBoth'),
        linkIn: queryMain('linkIn'),
        linkOut: queryMain('linkOut'),
        // store //Not implemented
        // table //Not implemented
        // tree //Not implemented

        /*** Branch ***/
        copySplit: queryPipes('copySplit'),
        exhaustMerge: queryMain('exhaustMerge'),
        fairMerge: queryMain('fairMerge'),
        ifThenElse: queryMain('ifThenElse'), //g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
        loop: queryMain('loop'),

        /*** Methods ***/
        //fill //Not implemented
        count: queryMain('count'),
        iterate: queryMain('iterate'),
        next: queryMain('next'),
        toList: queryMain('toList'),
        keys: queryMain('keys'),
        remove: queryMain('remove'),
        values: queryMain('values'),
        put: queryPipes('put'),

        getPropertyKeys: queryMain('getPropertyKeys'),
        setProperty: queryMain('setProperty'),
        getProperty: queryMain('getProperty'),

        //Titan specifics
        name: queryMain('name'),
        dataType: queryMain('dataType'),
        indexed: queryMain('indexed'),
        unique: queryMain('unique'),
        makePropertyKey: queryMain('makePropertyKey'),
        group: queryMain('group'),
        makeEdgeLabel: queryMain('makeEdgeLabel'),
        query: queryMain('query'),

        //Titan v0.4.0 specifics
        single: queryMain('single'),
        list: queryMain('list'),
        oneToMany: queryMain('oneToMany'), // replaces unique(Direction.IN)
        manyToOne: queryMain('manyToOne'), // replaces unique(Direction.OUT)
        oneToOne: queryMain('oneToOne'),   // replaces unique(Direction.IN).unique(Direction.OUT)
        makeKey: queryMain('makeKey'),
        makeLabel: queryMain('makeLabel'),
        make: queryMain('make'),
        sortKey: queryMain('sortKey'),
        signature: queryMain('signature'),
        unidirected: queryMain('unidirected'),

        createKeyIndex: queryMain('createKeyIndex'),
        getIndexes: queryMain('getIndexes'),
        hasIndex: queryMain('hasIndex'),

        /*** http ***/
        get: get(),

    };

    return Gremlin;
})();
