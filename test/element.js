var client = require('../index.js');
var Vertex = require("../src/objects/vertex");
var Gremlin = require('../src/gremlinscript');
var g = client.g;
var gremlin = client.gremlin;

describe('Graph elements', function() {
  describe('.setProperty()', function() {
    it('should set property', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');

      gremlin.line(v.setProperty('name', 'bob'));
      v.should.have.property('name', 'bob');
      gremlin.script.should.equal("\nv.setProperty('name','bob')");
    });
  });

  describe('.addProperty()', function() {
    it('should add property', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');

      gremlin.line(v.addProperty('name', 'alice'));
      v.should.have.property('name', 'alice');
      gremlin.script.should.equal("\nv.addProperty('name','alice')");
    });
  });

  describe('.setProperties()', function() {
    it('should set properties', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');
      gremlin.line(v.setProperties({
        'foo': 'bar',
        'baz': 'duh'
      }));
      v.should.have.property('foo', 'bar');
      v.should.have.property('baz', 'duh');

      gremlin.script.should.equal('\nv.setProperties(["foo":"bar","baz":"duh"])');
    });
  });

  describe('.addProperties()', function() {
    it('should add properties', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');
      gremlin.line(v.addProperties({
        'foo': 'bar',
        'baz': 'duh'
      }));
      v.should.have.property('foo', 'bar');
      v.should.have.property('baz', 'duh');

      gremlin.script.should.equal('\nv.addProperties(["foo":"bar","baz":"duh"])');
    });
  });

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

  describe('.remove()', function() {
    it('should remove element', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');

      gremlin.line(v.remove());
      gremlin.script.should.equal('\nv.remove()');
    });
  });

  describe('.keys()', function() {
    it("should chain .keys()", function() {
      var query = gremlin(g.v(1).keys());
      query.script.should.equal("g.v(1).keys()");
    });
  });

  describe('.values', function() {
    it("should chain .values()", function() {
      var query = client.gremlin(g.v(1).values());
      query.script.should.equal("g.v(1).values()");
    });
  });
});