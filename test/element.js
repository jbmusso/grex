var gRex = require('../index.js');
var Vertex = require("../src/elements/vertex");
var Gremlin = require('../src/gremlin');


describe('Graph elements', function() {
  describe('setProperty', function() {
    it('should set property', function() {
      var vertex = new Vertex(new Gremlin(gRex), 'v');
      vertex.setProperty('name', 'bob');
      vertex.should.have.property('name', 'bob');
    });
  });

  describe('addProperty', function() {
    it('should add property', function() {
      var vertex = new Vertex(new Gremlin(gRex), 'v');
      vertex.setProperty('name', 'alice');
      vertex.should.have.property('name', 'alice');
    });
  });

  describe('setProperties', function() {
    it('should set properties', function() {
      var vertex = new Vertex(new Gremlin(gRex), 'v');
      vertex.setProperties({
        'foo': 'bar',
        'baz': 'duh'
      });
      vertex.should.have.property('foo', 'bar');
      vertex.should.have.property('baz', 'duh');
    });
  });

  describe('getProperties', function() {
    it('should return properties', function() {
      var vertex = new Vertex(new Gremlin(gRex), 'v');
      vertex.setProperty('name', 'bob');

      var vertexProperties = vertex.getProperties();
      vertexProperties.should.have.property('_type', 'vertex');
      vertexProperties.should.have.property('_id', null);
      vertexProperties.should.have.property('name', 'bob');
    });
  });
});
