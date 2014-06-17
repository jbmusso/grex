var client = require('../');
var Gremlin = require('../src/gremlinscript');
var Vertex = client.Vertex;

describe('element', function() {
  describe('.getProperties()', function() {
    it('should return properties', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');
      v.setProperty('name', 'bob');

      var vertexProperties = v.getProperties();
      vertexProperties.should.have.property('_type', 'vertex');
      vertexProperties.should.have.property('_id', null);
      vertexProperties.should.have.property('name', 'bob');
    });
  });
});