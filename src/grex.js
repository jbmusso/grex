var q = require("q"),
    merge = require("./utils").merge,
    Transaction = require("./transaction/transaction"),
    qryMain = require("./gremlin");


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

        //Types
        this.makeType = qryMain('makeType', true);

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
    };

    gRex.prototype.begin = function (typeMap){
        typeMap = typeMap ? merge(typeMap, this.typeMap) : this.typeMap;

        return new Transaction(this.OPTS, typeMap);
    };

    return gRex;
})();
