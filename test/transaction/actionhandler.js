var gRex = require('../../index.js'),
    Transaction = require("../../src/transaction/transaction"),
    handlers = require("../../src/transaction/actionhandler"),
    Element = require("../../src/element");

var vertexHandler, edgeHandler;
var edge, vertex, transaction;

describe('Element ActionHandlers', function() {
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
        edge = Element.build("edge");
        vertex = Element.build("vertex");
        transaction = g.begin();
    });

    describe('Vertex ActionHandler class', function() {
        describe('when building a vertex action handler', function() {
            it('should return a vertex ActionHandler', function() {
                vertexHandler = handlers.ActionHandler.build(vertex, transaction, []);
                vertexHandler.should.be.instanceof(handlers.VertexActionHandler);
            });
        });
    });

    describe('Edge ActionHandler class', function() {
        describe('when building a vertex action handler', function() {
            it('should return an edge ActionHandler', function() {
                edgeHandler = handlers.ActionHandler.build(edge, transaction, []);
                edgeHandler.should.be.instanceof(handlers.EdgeActionHandler);
            });
        });
    });
});
