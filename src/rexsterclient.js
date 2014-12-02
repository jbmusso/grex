/*jslint node: true */
'use strict';
var http = require('http');
var querystring = require('querystring');
var request = require('request');

var _ = require("lodash");

var ObjectWrapper = require('gremlin-script').ObjectWrapper;
var GremlinScript = require('gremlin-script').GremlinScript;


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
    var requestOptions = {
      json: true,
      uri: 'http://' + this.options.host + ':' + this.options.port + '/graphs/' + this.options.graph + '/tp/gremlin',
      body: {
        script: gremlin.script.replace(/\$/g, "\\$"),
        params: gremlin.params,
        'rexster.showTypes': this.options.showTypes,
        load: this.options.load
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

    request.post(options, function(err, response, body) {
      if (err) {
        return callback(new Error(err));
      }

      if (body.error || body.message || body.success === false) {
        return callback(new Error(body.error || body.message || body.results));
      }

      callback(null, body);
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

  return RexsterClient;
})();
