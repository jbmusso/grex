var _ = require("lodash");

var Graph = require('./gremlin/graph');
var Pipeline = require('./gremlin/pipeline');
var Argument = require('./gremlin/arguments/argument');
var GremlinFunction = require('./gremlin/functions/function');

module.exports = (function() {
  function Gremlin(client) {
    this.script = '';
    this.params = {};
    this.client = client;

    // Define a default 'g' getter, returning a Graph
    Object.defineProperty(this, 'g', {
      get: function() {
        var graph = new Graph(this);

        return graph;
      }
    });
  }

  /**
   * Instantiate a new Gremlin script
   *
   * @return {Gremlin}
   */
  Gremlin.prototype.subScript = function() {
    return new Gremlin(this.client);
  };

  /**
   * Send the script to the server for execution, returning raw results.
   *
   * @param {Function}
   */
  Gremlin.prototype.exec = function(callback) {
    return this.client.exec(this).nodeify(callback);
  };

  /**
   * Send the script to the server for execution, returning instantiated
   * results.
   *
   * @param {Function}
   */
  Gremlin.prototype.fetch = function(callback) {
    return this.client.fetch(this).nodeify(callback);
  };

  /**
   * Return a Pipeline object with its own internal Gremlin object to append
   * string to.
   *
   * @return {Pipeline}
   */
  Gremlin.prototype._ = function() {
    var gremlin = new Gremlin(this.client);
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
  Gremlin.prototype.append = function(script) {
    this.script += script;
  };

  /**
   * Append an arbitrary string to the script as a new line.
   *
   * @public
   * @param {String} line
   */
  Gremlin.prototype.line = function(line) {
    this.script += '\n'+ line;
  };

  return Gremlin;
})();
