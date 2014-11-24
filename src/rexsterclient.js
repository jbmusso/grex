/*jslint node: true */
'use strict';
var http = require('http');
var querystring = require('querystring');

var _ = require("lodash");

var ResultFormatter = require("./resultformatter");
var ObjectWrapper = require('./objects/objectwrapper');
var GremlinScript = require('./gremlinscript');

module.exports = (function(){
  function RexsterClient(options) {
    var defaultOptions = {
      host: 'localhost',
      port: 8182,
      graph: 'tinkergraph',
      load: [],
      showTypes: false
    };

    this.options = _.defaults(options || {}, defaultOptions);
    this.fetchHandler = this.options.fetched || this.defaultFetchHandler;

    this.resultFormatter = new ResultFormatter();
  }

  /**
   * @param {ObjectWrapper} statement
   * @return {GremlinScript}
   */
  RexsterClient.prototype.createGremlinFromWrapper = function(statement) {
    var gremlin = new GremlinScript();
    var appender = gremlin.getAppender();
    appender(statement);

    return gremlin;
  };

  RexsterClient.prototype.buildRequestOptions = function(gremlin) {
    var qs = {
      script: gremlin.script.replace(/\$/g, "\\$"),
      'rexster.showTypes': this.options.showTypes,
    };

    if (this.options.load.length > 0) {
      qs.load = '['+ this.options.load.join(',') +']';
    }

    // Build custom bound parameters string
    var paramString = '&'+ _.map(gremlin.params, function(value, key) {
      return 'params.'+ key +'='+ querystring.escape(value);
    }).join('&');

    var requestOptions = {
      hostname: this.options.host,
      port: this.options.port,
      path: '/graphs/' + this.options.graph + '/tp/gremlin?' + querystring.stringify(qs) + paramString,
      headers: {
        'Content-type': 'application/json;charset=utf-8'
      }
    };

    return requestOptions;
  };

  /**
   * Send a GremlinScript script to Rexster for execution via HTTP, fetch and format
   * results.
   *
   * @param {GremlinScript} gremlin A Gremlin-Groovy script to execute
   *
   * @return {Promise}
   */
  RexsterClient.prototype.execute =
  RexsterClient.prototype.exec = function(gremlin, callback) {
    if (gremlin instanceof ObjectWrapper) {
      var statement = gremlin;
      gremlin = this.createGremlinFromWrapper(statement);
    }

    var options = this.buildRequestOptions(gremlin);
    var req = http.get(options, function(res) {
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('error', function(err) {
        callback(new Error(err));
      });

      res.on('end', function() {
        body = JSON.parse(body);

        if (body.error || body.message || body.success === false) {
          return callback(new Error(body.error || body.message || body.results));
        }
        callback(null, body);
      });
    });

    req.on('error', function(err) {
      callback(new Error(err));
    });
  };

  /**
   * Send a Gremlin script to Rexster for execution via HTTP, fetch and format
   * results as instantiated elements (typically Vertices and Edges).
   *
   * @param {GremlinScript} gremlin
   */
  RexsterClient.prototype.fetch = function(gremlin, callback) {
    var self = this;

    this.execute(gremlin, function(err, response) {
      callback(err, self.fetchHandler(response, response.results));
    });
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

  RexsterClient.prototype.transformResults = function(results) {
    return this.resultFormatter.formatResults(results);
  };

  return RexsterClient;
})();
