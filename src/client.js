var http = require('http');
var querystring = require('querystring');

var Q = require("q");
var _ = require("lodash");

var Client = require('./client');
var Gremlin = require('./gremlin');
var Graph = require("./gremlin/graph");
var classes = require("./classes");

var ResultFormatter = require("./resultformatter");


module.exports = (function(){
  function Client(options) {
    this.defaultOptions = {
      host: 'localhost',
      port: 8182,
      graph: 'tinkergraph'
    };

    this.options = _.defaults(options, this.defaultOptions);

    this.resultFormatter = new ResultFormatter();

    _.extend(this, classes);
    this.ClassTypes = classes;
  }

  Client.prototype.connect = function(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    this.options = _.defaults(options || {}, this.defaultOptions);
    this.fetchHandler = this.options.fetched || this.defaultFetchHandler;

    return Q.fcall(function() {
      return this;
    }.bind(this))
    .nodeify(callback);
  };

  /**
   * Send a Gremlin script for execution on the server, fetch and format
   * results.
   *
   * @param {Gremlin} gremlin A raw Gremlin (Groovy) script to execute
   */
  Client.prototype.exec = function(gremlin) {
    var deferred = Q.defer();

    var qs = {
      script: gremlin.script.replace(/\$/g, "\\$"),
      params: gremlin.params,
      'rexster.showTypes': true
    };

    var options = {
      hostname: this.options.host,
      port: this.options.port,
      path: '/graphs/' + this.options.graph + '/tp/gremlin?' + querystring.stringify(qs),
      headers: {
        'Content-type': 'application/json'
      }
    };

    var req = http.get(options, function(res) {
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        body = JSON.parse(body);
        var transformedResults = this.transformResults(body.results);
        body.results = transformedResults.results;
        body.typeMap = transformedResults.typeMap;
        return deferred.resolve(body);
      }.bind(this));

    }.bind(this));

    req.on('error', function() {
      return deferred.reject(e);
    });

    return deferred.promise;
  };

  Client.prototype.fetch = function(gremlin) {
    return this.exec(gremlin)
    .then(function(response) {
      return this.fetchHandler(response, response.results);
    }.bind(this));
  };

  Client.prototype.defaultFetchHandler = function(response, results) {
    return results;
  };

  Client.prototype.gremlin = function() {
    var gremlin = new Gremlin(this);

    return gremlin;
  };

  Client.prototype.transformResults = function(results) {
    return this.resultFormatter.formatResults(results);
  };

  return Client;
})();
