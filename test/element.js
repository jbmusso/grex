var ElementFactory = require("../src/elementfactory");

var Vertex = require("../src/elements/vertex");
var Edge = require("../src/elements/edge");

var edge, vertex;

describe('Elements', function() {
  describe('Factory', function() {
    it('should build a Vertex graph element', function() {
      vertex = ElementFactory.build("vertex");
      vertex.should.be.instanceof(Vertex);
      vertex.should.have.property('_type', 'vertex');
      vertex.should.have.property('_id', null);
    });

    it('should build an Edge graph element', function() {
      edge = ElementFactory.build("edge");
      edge.should.be.instanceof(Edge);
      edge.should.have.property('_type', 'edge');
      edge.should.have.property('_id', null);
    });
  });

  describe('Vertex element', function() {
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
      it('should return properties', function() {
        var vertexProperties = vertex.getProperties();
        vertexProperties.should.have.property('_type', 'vertex');
        vertexProperties.should.have.property('_id', null);
        vertexProperties.should.have.property('name', 'bob');
      });
    });
  });
});
