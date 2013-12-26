var Q = require("q"),
    _ = require("lodash");

var Graph = require("./graph");
var classes = require("./classes");


module.exports = (function(){
  function Grex(options) {
    this.options = _.defaults(options || {
      'host': 'localhost',
      'port': 8182,
      'graph': 'tinkergraph',
      'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
    });

    _.extend(this, classes);
    this.ClassTypes = classes;
  }

  Grex.prototype.connect = function(options, callback) {
    if(typeof options === 'function'){
      callback = options;
      options = undefined;
    }

    var graph = new Graph(this.options);

    return Q.fcall(function() {
      return graph;
    })
    .nodeify(callback);
  };

  return Grex;
})();
