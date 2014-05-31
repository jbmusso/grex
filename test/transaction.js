var grex = require('../index.js');

var client;
var g;

before(function(done){
  grex.connect(function(err, rexsterClient) {
    client = rexsterClient;
    g = client.g;
    done();
  });
});


var alice, bob;
var james, waldo;

describe('Transaction commit', function() {
  describe('when adding elements to the graph in a transaction', function() {
    it('should add a vertex in a transaction', function(done) {
      var gremlin = client.gremlin();
      gremlin(g.addVertex({ name: "Alice" }));

      gremlin.exec(function(err, result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add two vertices and an edge in a transaction', function(done) {
      var gremlin = client.gremlin();

      bob = gremlin.line(g.addVertex({ name: 'Bob' }), 'bob');
      waldo = gremlin.line(g.addVertex({ name: 'Ryan' }), 'waldo');
      gremlin(g.addEdge(bob, waldo, 'likes', { since: 'now' }));

      gremlin.exec(function(err, result) {
        result.should.have.property('success', true);
        done();
      });
    });

    // Clean up: remove james and waldo from the database
    // after(function(done) {
    //   var gremlin = client.gremlin;
    //   james.remove();
    //   waldo.remove();

    //   gremlin.exec()
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
    //   var gremlin = client.gremlin;

    //   alice.remove();
    //   bob.remove();

    //   gremlin.exec()
    //   .then(function(result) {
    //     done();
    //   });
    // });
  });
});
