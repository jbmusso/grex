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

  /**
   * Connect the Client to Rexster server.
   * While this method currently has an asynchronous behavior, it actually
   * does synchronous stuff.
   *
   * Accept the double promise/callback API.
   *
   * @param {Function} callback
   */
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
   * Send a Gremlin script to Rexster for execution via HTTP, fetch and format
   * results.
   *
   * @param {Gremlin} gremlin A Gremlin-Groovy script to execute
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

  /**
   * Send a Gremlin script to Rexster for execution via HTTP, fetch and format
   * results as instantiated elements (typically Vertices and Edges).
   *
   * @param {Gremlin} gremlin
   */
  Client.prototype.fetch = function(gremlin) {
    return this.exec(gremlin)
    .then(function(response) {
      return this.fetchHandler(response, response.results);
    }.bind(this));
  };

  /**
   * A noop, default handler for Client.fetch().
   *
   * @param {String} response - the complete HTTP response body
   * @param {Array} results - array of results, shorthand for response.results
   */
  Client.prototype.defaultFetchHandler = function(response, results) {
    return results;
  };

  /**
   * Instantiate and return a new Gremlin script
   *
   * @return {Gremlin}
   */
  Client.prototype.gremlin = function() {
    var gremlin = new Gremlin(this);

    return gremlin;
  };

  Client.prototype.transformResults = function(results) {
    return this.resultFormatter.formatResults(results);
  };

  return Client;
})();
