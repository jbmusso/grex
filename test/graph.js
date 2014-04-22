/*jshint expr: true*/ // won't complain for (1).should.be.an.Number;

var grex = require('../index.js');
var Vertex = require("../src/gremlin/vertex");
var Edge = require("../src/gremlin/edge");
var T = grex.T;
var Contains = grex.Contains;

var client;

before(function(done) {
  grex.connect(function(err, gremlinClient) {
    client = gremlinClient;
    done();
  });
});

describe('Graph methods', function() {
  var vertex, edge;

  describe('.addVertex()', function() {
    describe('when called with "{..}" arguments signature and no _id property', function() {
      before(function() {
        var g = client.gremlin().g;
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

      after(function() {
        vertex = null;
      });
    });

    describe('when called with "{..}" arguments signature and an _id property', function() {
      before(function() {
        var g = client.gremlin().g;
        vertex = g.addVertex({ foo: 'bar', _id: 1 });
      });

      it('should return a vertex', function() {
        vertex.should.be.an.instanceof(Vertex);
      });

      it('should have a numerical _id', function() {
        vertex.should.have.property('_id');
        vertex._id.should.be.a.Number;
      });

      it('should have properties set', function() {
        vertex.should.have.property('foo', 'bar');
      });

      after(function() {
        vertex = null;
      });
    });
  });

  describe('.addEdge()', function() {
    describe('when called with "_outV, _inV, label, {..}" arguments signature', function() {
      before(function() {
        var g = client.gremlin().g;
        edge = g.addEdge(20, 30, "knows", { since: 'now' });
      });

      it('should return an edge', function() {
        edge.should.be.an.instanceof(Edge);
      });

      it('should have a null _id', function() {
        edge.should.have.property('_id', null);
      });

      it('should have set _outV, _inV and _label properties', function() {
        edge.should.have.property('_outV', 20);
        edge.should.have.property('_inV', 30);
        edge.should.have.property('_label', 'knows');
      });

      it('should have own specified properties', function() {
        edge.should.have.property('since', 'now');
      });

      after(function() {
        edge = null;
      });
    });
  });

  describe('.createIndex()', function() {
    it('should handle string, Element.class arguments', function () {
      var query = client.gremlin().g.createIndex("my-index", Vertex);
      query.gremlin.script.should.equal("g.createIndex('my-index',Vertex.class)");
    });
  });

  describe('.idx()', function() {
    it("should handle `name, {key: value}` arguments", function() {
      var query = client.gremlin().g.idx("my-index", {'name':'marko'});
      query.gremlin.script.should.equal("g.idx('my-index')[[name:'marko']]");
    });

    it("should support g.idx().put()", function() {
      var gremlin = client.gremlin();
      var query = client.gremlin().g.idx("my-index").put("name", "marko", gremlin.g.v(1));
      query.gremlin.script.should.equal("g.idx('my-index').put('name','marko',g.v(1))");
    });
  });

  describe('.dropIndex()', function() {
    it("should handle `string` argument", function() {
      var query = client.gremlin().g.dropIndex("my-index");
      query.gremlin.script.should.equal("g.dropIndex('my-index')");
    });
  });
});