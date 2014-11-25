var _ = require('lodash');

var GremlinScript = require('gremlin-script').GremlinScript;
var classes = require('gremlin-script').Classes;
var GraphWrapper = require('gremlin-script').Structure.Graph;
var PipelineWrapper = require('gremlin-script').Structure.Pipeline;

var RexsterClient = require('./rexsterclient');


module.exports = (function() {
  function NodeGremlin() {
  }

  _.extend(NodeGremlin, classes);

  NodeGremlin.ClassTypes = classes;

  NodeGremlin.createClient = function(options) {
    var client = new RexsterClient(options);

    return client;
  };

  Object.defineProperty(NodeGremlin, 'gremlin', {
    get: function() {
      return function() {
        var gremlinScript = new GremlinScript();
        var appender = gremlinScript.getAppender();

        appender.apply(appender, arguments);

        return appender;
      };
    }
  });

  Object.defineProperty(NodeGremlin, 'g', {
    get: function() {
      var graph = new GraphWrapper('g');

      return graph;
    }
  });

  Object.defineProperty(NodeGremlin, '_', {
    get: function() {
      return function() {
        return new PipelineWrapper('_()');
      };
    }
  });

  return NodeGremlin;
})();