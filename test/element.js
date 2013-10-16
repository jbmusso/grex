var Element = require("../src/element");

var edge, vertex;

describe('Element classes', function() {
    describe('Element building', function() {
        it('should build an Element of Vertex class', function() {
            vertex = Element.build("vertex");
            vertex.should.be.instanceof(Element.Vertex);
        });

        it('should build an Element of Edge class', function() {
            edge = Element.build("edge");
            edge.should.be.instanceof(Element.Edge);
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
