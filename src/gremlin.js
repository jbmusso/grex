var _ = require("lodash");

var Graph = require('./graph');
var Pipeline = require('./pipeline');
var Argument = require('./arguments/argument');

module.exports = (function() {
  function Gremlin(client, options) {
    this.script = '';
    this.params = {};
    this.client = client;
    this.argumentHandler = client.argumentHandler;

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
    return new Gremlin(this.client);
  };

  Gremlin.prototype.exec = function(callback) {
    return this.client.exec(this).nodeify(callback);
  };

  Gremlin.prototype.fetch = function(callback) {
    return this.client.fetch(this).nodeify(callback);
  };

  /**
   * Transforms an arbitrary object into a Pipeline
   * @return {Pipeline}
   */
  Gremlin.prototype._ = function() {
    var gremlin = new Gremlin(this.client);
    gremlin.append('_' + gremlin.argumentHandler.buildString(arguments));

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
    var argumentList = [];
    args = _.isArray(args[0]) ? args[0] : args;

    _.each(args, function(arg) {
      var argObj = new Argument(arg, this.client.options);
      var partialScript = (arg.gremlin && arg.gremlin.script) || argObj.parse();
      argumentList.push(partialScript);
    }, this);

    this.append('.' + methodName + '('+ argumentList.join(',') +')');
  };

  /**
   * Used for retain & except commands, ie:
   *   g.V().retain([g.v(1), g.v(2), g.v(3)])
   *
   * @param {String} methodName
   * @param {Array} args Method's arguments
   */
  Gremlin.prototype.appendCollection = function(methodName, args) {
    var argumentList = [];

    if (_.isArray(args[0])) {
      // Passing in an array of Pipeline with Gremlin script as arguments
      _.each(args[0], function(pipeline) {
        argumentList.push(pipeline.gremlin.script);
      });

      this.append("." + methodName + "([" + argumentList.join(',') + "])");
    } else {
      this.append("." + methodName + this.argumentHandler.buildString(args[0]));
    }
  };

  return Gremlin;

})();
