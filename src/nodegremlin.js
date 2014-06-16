var _ = require('lodash');

var RexsterClient = require('./rexsterclient');
var classes = require('./classes/classes');
var GraphWrapper = require("./objects/graph");
var PipelineWrapper = require('./objects/pipeline');


module.exports = (function() {
  function NodeGremlin() {
  }

  _.extend(NodeGremlin, classes);

  NodeGremlin.ClassTypes = classes;

  NodeGremlin.createClient = function(options) {
    var client = new RexsterClient(options);
    client.connect(options);

    return client;
  };


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