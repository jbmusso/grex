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

describe('Transaction commit', function() {
  describe('when adding elements to the graph in a transaction', function() {
    it('should add a vertex in a transaction', function(done) {
      var tx = g.begin();

      alice = tx.addVertex('alice', { name: "Alice" });

      tx.commit()
      .then(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add two vertices and an edge in a transaction', function(done) {
      var tx = g.begin();
      bob = tx.addVertex('bob', { name: 'Bob' });
      waldo = tx.addVertex('waldo', { name: 'Ryan'});
      tx.addEdge(20, bob, waldo, 'likes', { since: 'now' });

      tx.commit()
      .done(function(result) {
        result.should.have.property('success', true);
        done();
      });
    });

    // Clean up: remove james and waldo from the database
    // after(function(done) {
    //   var tx = g.begin();
    //   james.remove();
    //   waldo.remove();

    //   tx.commit()
    //   .then(function(){
    //     done();
    //   });
    // });
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

    // it('should remove vertices in a transaction', function(done) {
    //   var tx = g.begin();

    //   alice.remove();
    //   bob.remove();

    //   tx.commit()
    //   .then(function(result) {
    //     done();
    //   });
    // });
  });
});
