var Vertex = require("../src/elements/vertex");
var Edge = require("../src/elements/edge");

var edge = new Edge(),
    vertex = new Vertex();

describe('Elements', function() {
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
