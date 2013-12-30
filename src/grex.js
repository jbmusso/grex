var Q = require("q"),
    _ = require("lodash");
var request = require("request");

var Graph = require("./graph");
var classes = require("./classes");
var ResultFormatter = require("./resultformatter");


module.exports = (function(){
  function Grex(options) {
    this.options = _.defaults(options || {
      'host': 'localhost',
      'port': 8182,
      'graph': 'tinkergraph',
      'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
    });

    this.resultFormatter = new ResultFormatter();

    _.extend(this, classes);
    this.ClassTypes = classes;
  }

  Grex.prototype.connect = function(options, callback) {
    if(typeof options === 'function'){
      callback = options;
      options = undefined;
    }

    var graph = new Graph(this);

    return Q.fcall(function() {
      return graph;
    })
    .nodeify(callback);
  };

  /**
   * Send a Gremlin script for execution on the server, fetch and format
   * results.
   *
   * @param {String} script A raw Gremlin (Groovy) script to execute
   */
  Grex.prototype.exec = function(script) {
    var deferred = Q.defer();

    var uri = '/graphs/' + this.options.graph + '/tp/gremlin';
    var url = 'http://' + this.options.host + ':' + this.options.port + uri;

    var options = {
      url: url,
      qs: {
        script: script,
        'rexster.showTypes': true
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true
    };

    request.get(options, function(err, res, body) {
      if (err) {
        return deferred.reject(err);
      }

      var transformedResults = this.transformResults(body.results);
      body.results = transformedResults.results;
      body.typeMap = transformedResults.typeMap;

      return deferred.resolve(body);
    }.bind(this));

    return deferred.promise;
  };

  Grex.prototype.transformResults = function(results) {
    return this.resultFormatter.formatResults(results);
  };

  return Grex;
})();
