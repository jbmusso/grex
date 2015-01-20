/*jslint node: true */
'use strict';
var request = require('request');
var JSONStream = require('JSONStream');

var _ = require("lodash");

var ObjectWrapper = require('gremlin-script').ObjectWrapper;
var GremlinScript = require('gremlin-script').GremlinScript;


function buildRequestOptions(gremlin, settings) {
  var requestOptions = {
    json: true,
    uri: 'http://' + settings.host + ':' + settings.port + '/graphs/' + settings.graph + '/tp/gremlin',
    body: {
      script: gremlin.script.replace(/\$/g, "\\$"),
      params: gremlin.params,
      'rexster.showTypes': settings.showTypes,
      load: settings.load
    }
  };

  return requestOptions;
}

function ensureGremlin(gremlin) {
  if (gremlin instanceof ObjectWrapper || _.isString(gremlin)) {
    var statement = gremlin;
    gremlin = new GremlinScript();
    var appender = gremlin.getAppender();
    appender(statement);
  }

  return gremlin;
}

var RexsterClient = (function(){
  function RexsterClient(options) {
    var defaultSettings = {
      host: 'localhost',
      port: 8182,
      graph: 'tinkergraph',
      load: [],
      showTypes: false
    };

    this.settings = _.defaults(options || {}, defaultSettings);
    this.fetchHandler = this.settings.fetched || function(response, results) {
      return results;
    };
  }

  /**
   * Send a GremlinScript script to Rexster for execution via HTTP, and
   * retrieve the raw Rexster response.
   *
   * @param {GremlinScript|ObjectWrapper|String} gremlin Script to execute
   * @param {Function} callback
   */
  RexsterClient.prototype.execute =
  RexsterClient.prototype.exec = function(gremlin, bindings, callback) {
    if (typeof bindings === 'function') {
      callback = bindings;
      bindings = {};
    }

    gremlin = ensureGremlin(gremlin);
    _.extend(gremlin.params, bindings);

    var options = buildRequestOptions(gremlin, this.settings);

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
  RexsterClient.prototype.fetch = function(gremlin, bindings, callback) {
    var self = this;

    if (typeof bindings === 'function') {
      callback = bindings;
      bindings = {};
    }

    this.execute(gremlin, bindings, function(err, response) {
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
  RexsterClient.prototype.fetchOne = function(gremlin, bindings, callback) {
    if (typeof bindings === 'function') {
      callback = bindings;
      bindings = {};
    }

    this.fetch(gremlin, bindings, function(err, results, response) {
      callback(null, results[0], response);
    });
  };

  RexsterClient.prototype.stream = function(gremlin, bindings) {
    gremlin = ensureGremlin(gremlin);
    _.extend(gremlin.params, bindings || {});

    var options = buildRequestOptions(gremlin, this.settings);

    return request.post(options).pipe(JSONStream.parse('results.*'));
  };

  return RexsterClient;
}());

module.exports = RexsterClient;