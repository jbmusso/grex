var gRex = require('../../index.js');
var Transaction = require("../../src/transaction/transaction");

var ActionHandlerFactory = require("../../src/transaction/actionhandlers/actionhandlerfactory");
var VertexActionHandler = require("../../src/transaction/actionhandlers/vertexactionhandler");
var EdgeActionHandler = require("../../src/transaction/actionhandlers/edgeactionhandler");

var ElementFactory = require("../../src/elementfactory");

var vertexHandler, edgeHandler;
var edge, vertex, transaction;

describe('Element ActionHandlers Factory', function() {
  before(function(done){
    gRex.connect()
    .then(function(result) {
      g = result;
      done();
    })
    .fail(function(error) {
      console.error(error);
    });
  });

  before(function() {
    edge = ElementFactory.build("edge");
    vertex = ElementFactory.build("vertex");
    transaction = g.begin();
  });

  it('should build a vertex ActionHandler', function() {
    vertexHandler = ActionHandlerFactory.build(vertex, transaction, []);
    vertexHandler.should.be.instanceof(VertexActionHandler);
  });

  it('should build an edge ActionHandler', function() {
    edgeHandler = ActionHandlerFactory.build(edge, transaction, []);
    edgeHandler.should.be.instanceof(EdgeActionHandler);
  });
});
