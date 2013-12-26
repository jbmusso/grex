var ElementFactory = require("../src/elementfactory");

var Vertex = require("../src/elements/vertex");
var Edge = require("../src/elements/edge");

var edge, vertex;

describe('Elements', function() {
  describe('Factory', function() {
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

  describe('Vertex element', function() {
    describe('Instantiation', function() {
      it('should have a _type property set to "vertex"', function() {
          vertex.should.have.property('_type', 'vertex');
      });

      it('should have an _id property set to "null"', function() {
          vertex.should.have.property('_id', null);
      });
    });

    describe('setProperty', function() {
      before(function() {
        vertex.setProperty('name', 'bob');
      });

      it('should set properties', function() {
        vertex.should.have.property('name', 'bob');
      });
    });

    describe('setProperties', function() {
      before(function() {
        vertex.setProperties({
          'foo': 'bar',
          'baz': 'duh'
        });
      });

      it('should set properties', function() {
        vertex.should.have.property('foo', 'bar');
        vertex.should.have.property('baz', 'duh');
      });
    });

    describe('getProperties', function() {
      var vertexProperties;
      before(function() {
        vertexProperties = vertex.getProperties();
      });

      it('should return properties', function() {
        vertexProperties.should.have.property('_type', 'vertex');
        vertexProperties.should.have.property('_id', null);
        vertexProperties.should.have.property('name', 'bob');
      });
    });
  });

  describe('Edge element', function() {
    it('should have a _type property set to "vertex"', function() {
        edge.should.have.property('_type', 'edge');
    });

    it('should have an _id property set to "null"', function() {
        edge.should.have.property('_id', null);
    });
  });
});
