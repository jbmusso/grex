/*jslint node: true */
'use strict';
var http = require('http');
var querystring = require('querystring');
var request = require('request');
var JSONStream = require('JSONStream');

var _ = require("lodash");

var ObjectWrapper = require('gremlin-script').ObjectWrapper;
var GremlinScript = require('gremlin-script').GremlinScript;


module.exports = (function(){
  function RexsterClient(options) {
    var defaultSettings = {
      host: 'localhost',
      port: 8182,
      graph: 'tinkergraph',
      load: [],
      showTypes: false
    };

    this.settings = _.defaults(options || {}, defaultSettings);
    this.fetchHandler = this.settings.fetched || this.defaultFetchHandler;
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
      uri: 'http://' + this.settings.host + ':' + this.settings.port + '/graphs/' + this.settings.graph + '/tp/gremlin',
      body: {
        script: gremlin.script.replace(/\$/g, "\\$"),
        params: gremlin.params,
        'rexster.showTypes': this.settings.showTypes,
        load: this.settings.load
      }
    };

    return requestOptions;
  };

  /**
   * Send a GremlinScript script to Rexster for execution via HTTP, and
   * retrieve the raw Rexster response.
   *
   * @param {GremlinScript} gremlin A Gremlin-Groovy script to execute
   * @param {Function} callback
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
   * Send a Gremlin script to Rexster for execution via HTTP, and
   * retrieve the `results` Array of the Rexster response.
   *
   * @param {GremlinScript} gremlin
   * @param {Function} callback
   */
  RexsterClient.prototype.fetch = function(gremlin, callback) {
    var self = this;

    this.execute(gremlin, function(err, response) {
      if (err) {
        return callback(new Error(err));
      }

      callback(null, self.fetchHandler(response, response.results), response);
    });
  };


  /**
   * Send a Gremlin script to Rexster for execution via HTTP, and
   * retrieve the first element of the `results` Array of the Rexster response.
   *
   * @param {GremlinScript} gremlin
   * @param {Function} callback
   */
  RexsterClient.prototype.fetchOne = function(gremlin, callback) {
    this.fetch(gremlin, function(err, results, response) {
      callback(null, results[0], response);
    });
  };

  RexsterClient.prototype.stream = function(gremlin) {
    var options = this.buildRequestOptions(gremlin);

    return request.post(options).pipe(JSONStream.parse('results.*'));
  };

  /**
   * A default handler for RexsterClient.fetch().
   *
   * @param {String} response - the complete HTTP response body
   * @param {Array} results - array of results, shorthand for response.results
   */
  RexsterClient.prototype.defaultFetchHandler = function(response, results) {
    return results;
  };

  return RexsterClient;
})();
