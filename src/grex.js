var q = require("q"),
    _ = require("lodash"),
    merge = require("./utils").merge,
    Transaction = require("./transaction/transaction"),
    queryMain = require("./gremlin");


module.exports = (function(){
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

        this.V = queryMain('V', true);
        this._ = queryMain('_', true);
        this.E = queryMain('E', true);
        this.V =  queryMain('V', true);

        //Methods
        this.e = queryMain('e', true);
        this.idx = queryMain('idx', true);
        this.v = queryMain('v', true);

        //Indexing
        this.createIndex = queryMain('createIndex', true);
        this.createKeyIndex = queryMain('createKeyIndex', true);
        this.getIndices = queryMain('getIndices', true);
        this.getIndexedKeys = queryMain('getIndexedKeys', true);
        this.getIndex = queryMain('getIndex', true);
        this.dropIndex = queryMain('dropIndex', true);
        this.dropKeyIndex = queryMain('dropKeyIndex', true);

        //Types
        this.makeKey = queryMain('makeKey', true);

        this.clear =  queryMain('clear', true);
        this.shutdown = queryMain('shutdown', true);
        this.getFeatures = queryMain('getFeatures', true);

        // Titan specifics
        this.getTypes = queryMain('getTypes', true);

        this.connect = function(){
            return q.fcall(function() {
                return self;
            });
        };
    }

    gRex.prototype.setOptions = function(options) {
        _.forOwn(options, function(value, name) {
            this.OPTS[name] = value;
        }, this);
    };

    gRex.prototype.begin = function (typeMap) {
        typeMap = typeMap ? merge(typeMap, this.typeMap) : this.typeMap;

        return new Transaction(this.OPTS, typeMap);
    };

    return gRex;
})();
