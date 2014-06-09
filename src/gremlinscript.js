/*jslint node: true */
'use strict';
var _ = require("lodash");
var util = require('util');

var Graph = require('./objects/graph');
var Pipeline = require('./objects/pipeline');
var Argument = require('./arguments/argument');
var GremlinFunction = require('./functions/function');

module.exports = (function() {
  function GremlinScript(client) {
    this.script = '';
    this.params = {};
    this.client = client;
    this.paramCount = 0;

    // Define a default 'g' getter, returning a Graph
    Object.defineProperty(this, 'g', {
      get: function() {
        var graph = new Graph('g');

        return graph;
      }
    });
  }

  /**
   * Send the script to the server for execution, returning raw results.
   *
   * @param {Function}
   */
  GremlinScript.prototype.exec = function(callback) {
    return this.client.exec(this).nodeify(callback);
  };

  /**
   * Send the script to the server for execution, returning instantiated
   * results.
   *
   * @param {Function}
   */
  GremlinScript.prototype.fetch = function(callback) {
    return this.client.fetch(this).nodeify(callback);
  };

  /**
   * Return a Pipeline object with its own internal GremlinScript object to append
   * string to.
   *
   * @return {Pipeline}
   */
  GremlinScript.prototype._ = function() {
    var gremlin = new GremlinScript(this.client);
    var func = new GremlinFunction('_', arguments);
    gremlin.append(func.toGroovy());

    return new Pipeline(gremlin);
  };

  /**
   * Append an arbitrary string to the script.
   *
   * @private
   * @param {String} script
   */
  GremlinScript.prototype.append = function(script) {
    this.script += script;
  };

  /**
   * Append an arbitrary string to the script as a new line.
   *
   * @public
   * @param {String} line
   */
  GremlinScript.prototype.line = function(statement) {
    var prefix = '';

    var groovyCode = statement.toGroovy ? statement.toGroovy() : statement;

    this.script += prefix + groovyCode + '\n';

    return statement;
  };

  GremlinScript.prototype.addBoundParams = function(boundParams) {
    var currentParamNames = [];
    var identifier;

    _.each(boundParams, function(boundParam) {
      identifier = 'p'+ this.paramCount++;
      this.params[identifier] = boundParam;
      currentParamNames.push(identifier);
    }, this);

    return currentParamNames;
  };

  GremlinScript.prototype.handleString = function(statement) {
    var currentParams = [statement, this.addBoundParams(_.rest(arguments))];

    this.line(util.format.apply(util.format, currentParams));
  };

  GremlinScript.prototype.handleHelper = function(statement) {
    this.line(statement);
  };

  GremlinScript.prototype.var = function(statement, identifier) {
    statement.identifier = identifier;
    var prefix = identifier + '=';

    var groovyCode = statement.toGroovy ? statement.toGroovy() : statement;

    this.script += prefix + groovyCode + '\n';

    return statement;
  };

  /**
   * @private
   */
  GremlinScript.prototype.getAppender = function() {
    var appendToScript = (function(statement) {
      if (arguments.length > 1) { // Assume query('g(%s)', 1) signature
        this.handleString.apply(this, arguments);
      } else if (statement) { // Assume query(g.v(1)) signature
        this.handleHelper(statement);
      }

      return this;
    }).bind(this);

    /**
     * Proxy some GremlinScript methods/getters to the appender
     */
    appendToScript.exec = GremlinScript.prototype.exec.bind(this);
    appendToScript.fetch = GremlinScript.prototype.fetch.bind(this);
    appendToScript.line = GremlinScript.prototype.line.bind(this);
    appendToScript.append = GremlinScript.prototype.append.bind(this);
    appendToScript.var = GremlinScript.prototype.var.bind(this);

    Object.defineProperty(appendToScript, 'script', {
      get: function() {
        return this.script;
      }.bind(this)
    });

    Object.defineProperty(appendToScript, 'params', {
      get: function() {
        return this.params;
      }.bind(this)
    });

    return appendToScript;
  };

  return GremlinScript;
})();
