/*jshint expr: true*/ // won't complain for (1).should.be.an.Number;

var gRex = require('../../index.js'),
  Transaction = require("../../src/transaction/transaction"),
  Vertex = require("../../src/elements/vertex"),
  Edge = require("../../src/elements/edge"),
  T = gRex.T,
  Contains = gRex.Contains;

var transaction;

before(function(done) {
  gRex.connect()
  .then(function(result) {
    g = result;
    done();
  })
  .fail(function(error) {
    console.error(error);
  });
});

describe('Transaction', function() {
  describe('begin()', function() {
    it('should start a transaction', function() {
      transaction = g.begin();
      transaction.should.be.an.instanceof(Transaction);
    });
  });

  describe('Transaction methods', function() {
    var vertex, edge;

    describe('#addVertex()', function() {
      describe('when called with "{..}" arguments signature', function() {
        before(function() {
          vertex = transaction.addVertex('vertex', { foo: "bar" });
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

      describe('when called with "id, {..}" arguments signature', function() {
        before(function() {
          vertex = transaction.addVertex('vertex', 1, { foo: 'bar' });
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

    describe('#addEdge()', function() {
      describe('when called with "_outV, _inV, label, {..}" arguments signature', function() {
        before(function() {
          edge = transaction.addEdge(20, 30, "knows", { since: 'now' });
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

      describe('when called with "id, _outV, _inV, label, {..}" arguments signature', function() {
        before(function() {
          edge = transaction.addEdge(1, 20, 30, "knows", { since: 'now' });
        });

        it('should return an edge', function() {
          edge.should.be.an.instanceof(Edge);
        });

        it('should have a numerical _id', function() {
          edge.should.have.property('_id');
          edge._id.should.be.a.Number;
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
  });
});
