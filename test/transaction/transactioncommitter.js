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

      var alice = tx.addVertex('alice', { name: "Alice" });

      tx.commit()
      .then(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add a vertex and an edge in a transaction', function(done) {
      var tx = g.begin();

      bob = tx.addVertex('bob', { name: 'Bob' });
      tx.addEdge(20, alice, bob, 'likes', { since: 'now' });

      tx.commit()
      .done(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add 2 vertices in a transaction', function(done) {
      var tx = g.begin();

      james = tx.addVertex('james', { name: 'James' });
      waldo = tx.addVertex('waldo', { name: 'Waldo' });

      tx.commit()
      .then(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    // Clean up: remove james and waldo from the database
    after(function(done) {
      var tx = g.begin();
      james.remove();
      waldo.remove();

      tx.commit()
      .then(function(){
        done();
      });
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

    it('should remove vertices in a transaction', function(done) {
      var tx = g.begin();

      alice.remove();
      bob.remove();

      tx.commit()
      .then(function(result) {
        done();
      });
    });
  });
});
