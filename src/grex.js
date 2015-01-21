var GremlinScript = require('gremlin-script').GremlinScript;
var bindParameter = require('gremlin-script').bindParameter;
var classes = require('gremlin-script').Classes;
var GraphWrapper = require('gremlin-script').Structure.Graph;
var PipelineWrapper = require('gremlin-script').Structure.Pipeline;

var RexsterClient = require('./rexsterclient');


var gRex = classes;

gRex.ClassTypes = classes;

gRex.createClient = function(options) {
  var client = new RexsterClient(options);

  return client;
};

gRex.bindParameter = bindParameter;

Object.defineProperty(gRex, 'gremlin', {
  get: function() {
    return function() {
      var gremlinScript = new GremlinScript();
      var appender = gremlinScript.getAppender();

      appender.apply(appender, arguments);

      return appender;
    };
  }
});

Object.defineProperty(gRex, 'g', {
  get: function() {
    var graph = new GraphWrapper('g');

    return graph;
  }
});

Object.defineProperty(gRex, '_', {
  get: function() {
    return function() {
      return new PipelineWrapper('_()');
    };
  }
});


module.exports = gRex;
