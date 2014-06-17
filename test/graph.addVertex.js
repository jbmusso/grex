var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

var Vertex = grex.Vertex;

describe('graph', function() {
  describe('.addVertex()', function() {
    describe('signature: no parameter', function() {
      before(function() {
        vertex = g.addVertex();
      });

      it('should return a vertex', function() {
        vertex.should.be.an.instanceof(Vertex);
      });

      it('should not have any property', function() {
        /*jshint -W030 */
        (vertex.asObject()._id === null).should.be.true;
        vertex.asObject()._type.should.equal('vertex');
      });

      it('should generate Groovy script', function() {
        var query = gremlin(vertex);
        query.script.should.equal('g.addVertex()\n');
      });
    });

    describe('signature: empty object {} parameter', function() {
      before(function() {
        vertex = g.addVertex({});
      });

      it('should return a vertex', function() {
        vertex.should.be.an.instanceof(Vertex);
      });

      it('should not have any property', function() {
        /*jshint -W030 */
        (vertex.asObject()._id === null).should.be.true;
        vertex.asObject()._type.should.equal('vertex');
      });

      it('should generate Groovy script', function() {
        var query = gremlin(vertex);
        query.script.should.equal('g.addVertex()\n');
      });
    });

    describe('signature: (Object)', function() {
      var vertex;

      before(function() {
        vertex = g.addVertex({ foo: "bar" });
      });

      it('should return a vertex pending for addition', function() {
        vertex.should.be.an.instanceof(Vertex);
      });

      it('should have a null _id', function() {
        vertex.asObject().should.have.property('_id', null);
      });

      it('should have properties set', function() {
        vertex.asObject().should.have.property('foo', 'bar');
      });

      it('should generate Groovy script', function() {
        var query = gremlin(vertex);
        query.script.should.equal('g.addVertex(["foo":"bar"])\n');
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
        vertex.asObject().should.have.property('_id');
        vertex.asObject()._id.should.be.a.Number.and.equal(1);
      });

      it('should have properties set', function() {
        vertex.asObject().should.have.property('foo', 'bar');
      });

      it('should generate Groovy script', function() {
        var query = gremlin(vertex);
        query.script.should.equal('g.addVertex(1,["foo":"bar"])\n');
      });
    });
  });
});
