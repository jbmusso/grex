var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var Edge = client.ClassTypes.Edge;
var Vertex = client.ClassTypes.Vertex;

describe('graph', function() {
  describe('.addEdge(Number, Number, String, {})', function() {
    var edge;

    before(function() {
      edge = g.addEdge(20, 30, "knows", { since: 'now' });
    });

    it('should return an edge', function() {
      edge.should.be.an.instanceof(Edge);
    });

    it('should have a null _id', function() {
      edge.asObject().should.have.property('_id', null);
    });

    it('should have set _outV, _inV and _label properties', function() {
      edge.should.have.property('_outV', 20);
      edge.should.have.property('_inV', 30);
      edge.should.have.property('_label', 'knows');
    });

    it('should have own specified properties', function() {
      edge.should.have.property('since', 'now');
    });
  });

  describe('.addEdge(Vertex, Vertex, String, {})', function() {
    var edge;

    before(function() {
      var v1 = g.addVertex({ name: 'Bob' });
      var v2 = g.addVertex({ name: 'Alice' });
      edge = g.addEdge(v1, v2, 'knows', { since: 'now' });
    });

    it('should return an edge', function() {
      edge.should.be.an.instanceof(Edge);
    });

    it('should have a null _id', function() {
      edge.asObject().should.have.property('_id', null);
    });

    it('should have _outV and _inV properties as Vertex', function() {
      edge._outV.should.be.an.instanceof(Vertex);
      edge._inV.should.be.an.instanceof(Vertex);
    });

    it('should have a _label', function() {
      edge.should.have.property('_label', 'knows');
    });
  });
});
