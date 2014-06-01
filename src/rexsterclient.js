var http = require('http');
var querystring = require('querystring');

var Q = require("q");
var _ = require("lodash");

var GremlinScript = require('./gremlinscript');
var Graph = require("./objects/graph");
var Pipeline = require('./objects/pipeline');
var classes = require("./classes/classes");

var ResultFormatter = require("./resultformatter");


module.exports = (function(){
  function RexsterClient(options) {
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

  Object.defineProperty(RexsterClient.prototype, 'g', {
    get: function() {
      var graph = new Graph('g');

      return graph;
    }
  });

  Object.defineProperty(RexsterClient.prototype, '_', {
    get: function() {
      return function(arguments) {
        return new Pipeline('_()');
      };
    }
  });

  /**
   * Establish a connection with Rexster server.
   * While this method currently has an asynchronous behavior, it actually
   * does synchronous stuff.
   *
   * Accept the double promise/callback API.
   *
   * @param {Function} callback
   */
  RexsterClient.prototype.connect = function(options, callback) {
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
   * Send a GremlinScript script to Rexster for execution via HTTP, fetch and format
   * results.
   *
   * @param {GremlinScript} gremlin A Gremlin-Groovy script to execute
   */
  RexsterClient.prototype.exec = function(gremlin) {
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
   * @param {GremlinScript} gremlin
   */
  RexsterClient.prototype.fetch = function(gremlin) {
    return this.exec(gremlin)
    .then(function(response) {
      return this.fetchHandler(response, response.results);
    }.bind(this));
  };

  /**
   * A noop, default handler for RexsterClient.fetch().
   *
   * @param {String} response - the complete HTTP response body
   * @param {Array} results - array of results, shorthand for response.results
   */
  RexsterClient.prototype.defaultFetchHandler = function(response, results) {
    return results;
  };

  Object.defineProperty(RexsterClient.prototype, 'gremlin', {
    get: function() {
      return this.createGremlinScript.bind(this)
    }
  })
  /**
   * Instantiate a new GremlinScript and return a function responsible
   * for appending bits of Gremlin to this GremlinScript.
   *
   * @return {Function}
   */
  RexsterClient.prototype.createGremlinScript = function() {
    var gremlinScript = new GremlinScript(this);

    gremlinScript.appendMany([].slice.call(arguments));

    return gremlinScript.getAppender()
  };

  RexsterClient.prototype.transformResults = function(results) {
    return this.resultFormatter.formatResults(results);
  };

  return RexsterClient;
})();
