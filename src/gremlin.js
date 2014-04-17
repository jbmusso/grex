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

    Object.defineProperty(this, 'g', {
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
    var func = new GremlinFunction('_', arguments);
    gremlin.append(func.toGroovy());

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

  return Gremlin;
})();
