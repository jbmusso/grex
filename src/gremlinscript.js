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
  }

  /**
   * Append an arbitrary string to the script as a new line.
   *
   * @private
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
   * According to its type (ie. String or ObjectWrapper), handle and add a
   * statement to the current script.
   *
   * @private
   * @param {String|ObjectWrapper} statement
   */
  GremlinScript.prototype.appendStatement = function(statement) {
    if (arguments.length > 1) {
      // Assume query('g(%s)', 1) signature
      this.handleString.apply(this, arguments);
    } else if (_.isString(statement)) {
      // Assume query('g.v(1)') signature
      this.line(statement);
    } else if (statement) {
      // Assume query(g.v(1)) signature
      this.handleHelper(statement);
    }
  };

  /**
   * Returns a function responsible for handling statements and ultimately
   * appending bits of Gremlin-Groovy to this GremlinScript.
   *
   * @private
   * @return {Function}
   */
  GremlinScript.prototype.getAppender = function() {
    var self = this;

    function GremlinAppender() {
      self.appendStatement.apply(self, arguments);

      return self;
    }

    /**
     * Proxy some GremlinScript methods/getters to the appender
     */
    GremlinAppender.var = GremlinScript.prototype.var.bind(this);

    Object.defineProperty(GremlinAppender, 'script', {
      get: function() {
        return self.script;
      }
    });

    Object.defineProperty(GremlinAppender, 'params', {
      get: function() {
        return self.params;
      }
    });

    return GremlinAppender;
  };

  return GremlinScript;
})();
