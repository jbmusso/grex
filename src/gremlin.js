var _ = require("lodash");

var Graph = require('./graph');
var Pipeline = require('./pipeline');

module.exports = (function() {
  function Gremlin(gRex, options) {
    this.script = '';
    this.gRex = gRex;
    this.argumentHandler = gRex.argumentHandler;

    var settings = _.defaults(options || {
      graph: 'g'
    });

    Object.defineProperty(this, settings.graph, {
      get: function() {
        var graph = new Graph(this);

        return graph;
      }
    });
  }

  Gremlin.prototype.subScript = function() {
    return new Gremlin(this.gRex);
  };

  Gremlin.prototype.exec = function(callback) {
    return this.gRex.exec(this.script).nodeify(callback);
  };

  /**
   * Transforms an arbitrary object into a Pipeline
   * @return {Pipeline}
   */
  Gremlin.prototype._ = function() {
    var gremlin = new Gremlin(this.gRex);
    gremlin.append('_' + gremlin.argumentHandler.build(arguments, true));

    return new Pipeline(gremlin);
  };

  /**
   * Append an arbitrary Gremlin string to current script.
   *
   * @private
   * @param {String} script
   */
  Gremlin.prototype.append = function(script) {
    this.script += script;
  };

  /**
   * Append an arbitrary Gremlin string to current script as a new line.
   *
   * @public
   * @param {String} line
   */
  Gremlin.prototype.line = function(line) {
    this.script += '\n'+ line;
  };


  Gremlin.prototype.stringifyArgument = function(argument) {
    return JSON.stringify(argument).replace('{', '[').replace('}', ']');
  };

  /**
   * Populate a Gremlin script string with default behavior. Used for most
   * commands.
   * This method optionally takes a new Pipeline object as second parameter.
   *
   * @param {String} methodName
   * @param {Array} args Method's arguments
   */
  Gremlin.prototype.appendMain = function(methodName, args) {
    args = _.isArray(args[0]) ? args[0] : args;

    this.append('.' + methodName + this.argumentHandler.build(args));
  };

  /**
   * Alternative 'index' and 'range' commands, ie:
   *   index() => [i]
   *   range() => [1..2]
   *
   * Do not pass in method name, just string range.
   *
   * @param {String} arg
   */
  Gremlin.prototype.appendIndex = function(arg) {
    this.append('['+ arg[0].toString() + ']');
  };

  /**
   * Used for 'and', 'or' & 'put commands, ie:
   *   g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
   *
   * @param {String} methodName
   * @param {Array} args Method's arguments
   */
  Gremlin.prototype.appendPipes = function(methodName, args) {
    args = _.isArray(args[0]) ? args[0] : args;

    this.append("." + methodName + "(");

    _.each(args, function(arg) {
      var partialScript = (arg.gremlin && arg.gremlin.script) || this.argumentHandler.parse(arg);
      this.append(partialScript + ",");
    }, this);

    this.script = this.script.slice(0, -1); // Remove trailing comma
    this.append(")");
  };

  /**
   * Used for retain & except commands, ie:
   *   g.V().retain([g.v(1), g.v(2), g.v(3)])
   *
   * @param {String} methodName
   * @param {Array} args Method's arguments
   */
  Gremlin.prototype.appendCollection = function(methodName, args) {
    var param = '';

    if (_.isArray(args[0])) {
      // Passing in an array of Pipeline with Gremlin script as arguments
      _.each(args[0], function(pipeline) {
        param += pipeline.gremlin.script;
        param += ",";
      });

      this.append("." + methodName + "([" + param + "])");
    } else {
      this.append("." + methodName + this.argumentHandler.build(args[0]));
    }
  };

  return Gremlin;

})();
