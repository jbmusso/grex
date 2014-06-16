/*jslint node: true */
'use strict';
var _ = require("lodash");
var util = require('util');

var GraphWrapper = require('./objects/graph');
var PipelineWrapper = require('./objects/pipeline');
var Argument = require('./arguments/argument');
var GremlinFunction = require('./functions/function');

module.exports = (function() {
  function GremlinScript() {
    this.script = '';
    this.params = {};
    this.paramCount = 0;
    this.identifierCount = 0;

    // Define a default 'g' getter, returning a GraphWrapper
    Object.defineProperty(this, 'g', {
      get: function() {
        var graph = new GraphWrapper('g');

        return graph;
      }
    });
  }

  /**
   * Return a PipelineWrapper object with its own internal GremlinScript object to append
   * string to.
   *
   * @return {PipelineWrapper}
   */
  GremlinScript.prototype._ = function() {
    var gremlin = new GremlinScript();
    var func = new GremlinFunction('_', arguments);
    gremlin.append(func.toGroovy());

    return new PipelineWrapper(gremlin);
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
  GremlinScript.prototype.line = function(line) {
    this.script += line + '\n';
  };

  /**
   * Add bound parameters to the script. This currently only works when
   * using the formatted string. It does not work with gRex helpers/wrappers.
   *
   * @private
   * @param {Array} boundParams
   */
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

  /**
   * Handle a string statement using Node util.format() function.
   *
   * @private
   * @param {String} statement
   */
  GremlinScript.prototype.handleString = function(statement) {
    var currentParams = [statement];
    currentParams = currentParams.concat(this.addBoundParams(_.rest(arguments)));

    this.line(util.format.apply(util.format, currentParams));
  };

  /**
   * Handle a helper statement wrapped in one of gRex Wrapper classes
   *
   * @private
   * @param {ObjectWrapper} wrapper
   * @return {ObjectWrapper}
   */
  GremlinScript.prototype.handleHelper = function(wrapper) {
    this.line(wrapper.toGroovy());

    return wrapper;
  };

  /**
   * Identify a statement within the script with the provided optional
   * identifier. Will assign an automatica identifier instead.
   *
   * @public
   * @param {ObjectWrapper} wrapper
   * @param {String} identifier - an optional identifier
   */
  GremlinScript.prototype.var = function(wrapper, identifier) {
    identifier = identifier || 'i'+ this.identifierCount++;
    wrapper.identifier = identifier;
    var prefix = identifier + '=';

    var groovyCode = wrapper.toGroovy ? wrapper.toGroovy() : wrapper;

    this.script += prefix + groovyCode + '\n';

    return wrapper;
  };

  /**
   * Returns a function responsible for handling statements and ultimately
   * appending bits of Gremlin-Groovy to this GremlinScript.
   *
   * @private
   * @return {Function}
   */
  GremlinScript.prototype.getAppender = function() {
    var appendToScript = (function(statement) {
      if (_.isString(statement)) { // Assume query('g(%s)', 1) signature
        if (arguments.length > 1) {
          this.handleString.apply(this, arguments);
        } else {
          this.line(statement);
        }
      } else if (statement) { // Assume query(g.v(1)) signature
        this.handleHelper(statement);
      }

      return this;
    }).bind(this);

    /**
     * Proxy some GremlinScript methods/getters to the appender
     */
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
