var client = require('../index.js');
var Vertex = require("../src/gremlin/vertex");
var Gremlin = require('../src/gremlin');


describe('Graph elements', function() {
  describe('.setProperty()', function() {
    it('should set property', function() {
      var gremlin = new Gremlin(client);
      var vertex = new Vertex(gremlin, 'v');

      vertex.setProperty('name', 'bob');
      vertex.should.have.property('name', 'bob');
      gremlin.script.should.equal("\nv.setProperty('name','bob')");
    });
  });

  describe('.addProperty()', function() {
    it('should add property', function() {
      var gremlin = new Gremlin(client);
      var vertex = new Vertex(gremlin, 'v');

      vertex.addProperty('name', 'alice');
      vertex.should.have.property('name', 'alice');
      gremlin.script.should.equal("\nv.addProperty('name','alice')");
    });
  });

  describe('.setProperties()', function() {
    it('should set properties', function() {
      var gremlin = new Gremlin(client);
      var vertex = new Vertex(gremlin, 'v');
      vertex.setProperties({
        'foo': 'bar',
        'baz': 'duh'
      });
      vertex.should.have.property('foo', 'bar');
      vertex.should.have.property('baz', 'duh');

      gremlin.script.should.equal('\nv.setProperties(["foo":"bar","baz":"duh"])');
    });
  });

  describe('.addProperties()', function() {
    it('should add properties', function() {
      var gremlin = new Gremlin(client);
      var vertex = new Vertex(gremlin, 'v');
      vertex.addProperties({
        'foo': 'bar',
        'baz': 'duh'
      });
      vertex.should.have.property('foo', 'bar');
      vertex.should.have.property('baz', 'duh');

      gremlin.script.should.equal('\nv.addProperties(["foo":"bar","baz":"duh"])');
    });
  });

  describe('.getProperties()', function() {
    it('should return properties', function() {
      var gremlin = new Gremlin(client);
      var vertex = new Vertex(gremlin, 'v');
      vertex.setProperty('name', 'bob');

      var vertexProperties = vertex.getProperties();
      vertexProperties.should.have.property('_type', 'vertex');
      vertexProperties.should.have.property('_id', null);
      vertexProperties.should.have.property('name', 'bob');
    });
  });

  describe('.remove()', function() {
    it('should remove element', function() {
      var gremlin = new Gremlin(client);
      var vertex = new Vertex(gremlin, 'v');

      vertex.remove();
      gremlin.script.should.equal('\nv.remove()');
    });
  });

  describe('.keys()', function() {
    it("should chain .keys()", function() {
      var query = client.gremlin().g.v(1).keys();
      query.gremlin.script.should.equal("g.v(1).keys()");
    });
  });

  describe('.values', function() {
    it("should chain .values()", function() {
      var query = client.gremlin().g.v(1).values();
      query.gremlin.script.should.equal("g.v(1).values()");
    });
  });


});
