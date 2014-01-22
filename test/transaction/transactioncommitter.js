var gRex = require('../../index.js'),
  Transaction = require("../../src/transaction/transaction");

var g, updatedEdge;

before(function(done){
  gRex.connect()
  .then(function(result) {
    g = result;
    done();
  })
  .fail(function(error) {
    console.error(error);
  });
});


var alice, bob;
var james, waldo;

describe('Transaction Committer', function() {
  describe('when adding elements to the graph', function() {
    it('should add a vertex in a transaction', function(done) {
      var tx = g.begin();

      alice = tx.addVertex({ name: "Alice" });

      tx.commit()
      .then(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add a vertex and an edge in a transaction', function(done) {
      var tx = g.begin();

      bob = tx.addVertex({ name: 'Bob' });
      tx.addEdge(20, alice, bob, 'likes', { since: 'now' });

      tx.commit()
      .done(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add 2 vertices in a transaction', function(done) {
      var tx = g.begin();

      james = tx.addVertex({ name: 'James' });
      waldo = tx.addVertex({ name: 'Waldo' });

      tx.commit()
      .then(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    // Clean up: remove james and waldo from the database
    after(function(done) {
      var tx = g.begin();
      tx.removeVertex(james._id);
      tx.removeVertex(waldo._id);

      tx.commit()
      .then(function(){
        done();
      });
    });
  });

  describe('when updating a vertex', function() {
    before(function(done) {
      g.V('name', 'Alice').get(function(err, result) {
        alice = result.results[0];
        done();
      });
    });

    it('should update a property', function(done) {
      var tx = g.begin();

      tx.updateVertex(alice._id, { name: 'Jess' });

      tx.commit()
      .then(function(result) {
        result.should.have.property('txProcessed', 1);
        result.should.have.property('success', true);
        done();
      })
      .fail(function(error) {
        console.error(error);
        done();
      });
    });
  });

  // Currently bugged?
  // @see https://groups.google.com/forum/#!topic/gremlin-users/i0Uci2yZoaQ
  describe('when updating an edge', function() {
    before(function(done) {
      g.V('name', 'Jess').outE('likes').get(function(err, result) {
        updatedEdge = result.results[0];
        done();
      });
    });

    it('should update a property', function(done) {
      tx = g.begin();
      tx.updateEdge(updatedEdge._id, { since: 'forever', foo: 'bar' });

      tx.commit()
      .then(function(result) {
        done();
      })
      .fail(function(error) {
        console.error(error);
        done();
      });
    });
  });

  describe('when deleting two vertices', function() {
    before(function(done) {
      g.V('name', 'Jess').get(function(err, result) {
        alice = result.results[0];
        done();
      });
    });

    before(function(done) {
      g.V('name', 'Bob').get(function(err, result) {
        bob = result.results[0];
        done();
      });
    });

    it('should delete vertices in a transaction', function(done) {
      var tx = g.begin();

      tx.removeVertex(alice);
      tx.removeVertex(bob);

      tx.commit()
      .then(function(result) {
        done();
      });
    });
  });
});
