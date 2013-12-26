var Q = require("q"),
    _ = require("lodash");

var Graph = require("./graph");


module.exports = (function(){
    function Grex(options) {
        this.options = _.defaults(options || {
            'host': 'localhost',
            'port': 8182,
            'graph': 'tinkergraph',
            'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
        });
    }

    Grex.prototype.connect = function(){
        return Q.fcall(function() {
            return new Graph(this.options);
        }.bind(this));
    };


    return Grex;
})();
