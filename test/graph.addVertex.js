var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var Vertex = require("../src/objects/vertex");

describe('graph', function() {
  describe('.addVertex()', function() {
    describe('signature: (Object)', function() {
      var vertex;

      before(function() {
        vertex = g.addVertex({ foo: "bar" });
      });

      it('should return a vertex pending for addition', function() {
        vertex.should.be.an.instanceof(Vertex);
      });

      it('should have a null _id', function() {
        vertex.should.have.property('_id', null);
      });

      it('should have properties set', function() {
        vertex.should.have.property('foo', 'bar');
      });
    });

    describe('signature: (Object with _id property)', function() {
      var vertex;

      before(function() {
        vertex = g.addVertex({ foo: 'bar', _id: 1 });
      });

      it('should return a vertex', function() {
        vertex.should.be.an.instanceof(Vertex);
      });

      it('should have a numerical _id', function() {
        vertex.should.have.property('_id');
        vertex._id.should.be.a.Number.and.equal(1);
      });

      it('should have properties set', function() {
        vertex.should.have.property('foo', 'bar');
      });
    });
  });
});
