var ElementFactory = require("../src/elementfactory");

var Vertex = require("../src/elements/vertex");
var Edge = require("../src/elements/edge");

var edge, vertex;

describe('Element classes', function() {
    describe('Element building', function() {
        it('should build an Element of Vertex class', function() {
            vertex = ElementFactory.build("vertex");
            vertex.should.be.instanceof(Vertex);
        });

        it('should build an Element of Edge class', function() {
            edge = ElementFactory.build("edge");
            edge.should.be.instanceof(Edge);
            edge.should.have.property('_type', 'edge');
        });
    });

    describe('Built vertex Element', function() {
        it('should have a _type property set to "vertex"', function() {
            vertex.should.have.property('_type', 'vertex');
        });

        it('should have an _id property set to "null"', function() {
            vertex.should.have.property('_id', null);
        });
    });


    describe('Edge edge Element', function() {
        it('should have a _type property set to "vertex"', function() {
            edge.should.have.property('_type', 'edge');
        });

        it('should have an _id property set to "null"', function() {
            edge.should.have.property('_id', null);
        });
    });
});
