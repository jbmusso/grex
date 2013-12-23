var request = require("request");
var q = require("q");
var _ = require("lodash");

var Utils = require("./utils");
var isClosure = Utils.isClosure;
var isGraphReference = Utils.isGraphReference;
var isRegexId = Utils.isRegexId;
var merge = Utils.merge;


function qryMain(method, reset){
    return function(){
        var gremlin = reset ? new Gremlin(this) : this._buildGremlin(this.params),
            args = '',
            appendArg = '';

        //cater for select array parameters
        if(method == 'select'){
            args = arguments;
            gremlin.params += '.' + method + buildArgs.call(this, args, true);
        } else {
            args = _.isArray(arguments[0]) ? arguments[0] : arguments;

            //cater for idx param 2
            if(method == 'idx' && args.length > 1){
                for (var k in args[1]){
                    appendArg = k + ":";
                    appendArg += parseArgs.call(this, args[1][k]);
                }

                appendArg = "[["+ appendArg + "]]";
                args.length = 1;
            }

            gremlin.params += '.' + method + buildArgs.call(this, args);
        }

        gremlin.params += appendArg;

        return gremlin;
    };
}

module.exports = qryMain;


//[i] => index & [1..2] => range
//Do not pass in method name, just string arg
function qryIndex(){
    return function(arg) {
        var gremlin = this._buildGremlin(this.params);
        gremlin.params += '['+ arg.toString() + ']';

        return gremlin;
    };
}


//and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
function qryPipes(method){
    return function() {
        var gremlin = this._buildGremlin(this.params),
            args = [],
            isArr = _.isArray(arguments[0]),
            argsLen = isArr ? arguments[0].length : arguments.length;

        gremlin.params += "." + method + "(";

        for (var _i = 0; _i < argsLen; _i++) {
            gremlin.params += isArr ? arguments[0][_i].params || parseArgs.call(this, arguments[0][_i]) : arguments[_i].params || parseArgs.call(this, arguments[_i]);
            gremlin.params += ",";
        }

        gremlin.params = gremlin.params.slice(0, -1);
        gremlin.params += ")";

        return gremlin;
    };
}

//retain & except => g.V().retain([g.v(1), g.v(2), g.v(3)])
function qryCollection(method){
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
            gremlin.params += "." + method + buildArgs.call(this, arguments[0]);
        }

        return gremlin;
    };
}

function buildArgs(array, retainArray) {
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
            argList += "[" + parseArgs.call(this, v) + "],";
        } else {
            argList += parseArgs.call(this, v) + ",";
        }
    }, this);

    argList = argList.slice(0, -1);

    return '(' + argList + ')' + append;
}

function parseArgs(val) {
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

    function createTypeDef(obj){
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
                    tempObj = createTypeDef(obj[i].value);
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
                    tempObj = createTypeDef(v.value);
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
                            typeObj = createTypeDef(v.value);
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
        _buildGremlin: function (qryString){
            this.params = qryString;
            return this;
        },

        /*** Transform ***/
        _: qryMain('_'),
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

        //Titan specifics
        name: qryMain('name'),
        dataType: qryMain('dataType'),
        indexed: qryMain('indexed'),
        unique: qryMain('unique'),
        makePropertyKey: qryMain('makePropertyKey'),
        group: qryMain('group'),
        makeEdgeLabel: qryMain('makeEdgeLabel'),
        query: qryMain('query'),

        //Titan v0.4.0 specifics
        single: qryMain('single'),
        list: qryMain('list'),
        oneToMany: qryMain('oneToMany'), // replaces unique(Direction.IN)
        manyToOne: qryMain('manyToOne'), // replaces unique(Direction.OUT)
        oneToOne: qryMain('oneToOne'),   // replaces unique(Direction.IN).unique(Direction.OUT)
        makeKey: qryMain('makeKey'),
        makeLabel: qryMain('makeLabel'),
        make: qryMain('make'),
        sortKey: qryMain('sortKey'),
        signature: qryMain('signature'),
        unidirected: qryMain('unidirected'),

        createKeyIndex: qryMain('createKeyIndex'),
        getIndexes: qryMain('getIndexes'),
        hasIndex: qryMain('hasIndex'),

        /*** http ***/
        get: get(),

    };

    return Gremlin;
})();
