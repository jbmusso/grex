var grex = require('../index.js');

var client;
var g;
var gremlin;

before(function(done){
  grex.connect(function(err, rexsterClient) {
    client = rexsterClient;
    gremlin = client.gremlin;
    g = client.g;
    done();
  });
});


var alice, bob;
var james, waldo;

describe('Transaction commit', function() {
  describe('when adding elements to the graph in a transaction', function() {
    it('should add a vertex in a transaction', function(done) {
      var query = gremlin(g.addVertex({ name: "Alice" }));

      query.exec(function(err, result) {
        result.should.have.property('success', true);
        done();
      });
    });

    it('should add two vertices and an edge in a transaction', function(done) {
      var query = gremlin();
      bob = query.line(g.addVertex({ name: 'Bob' }), 'bob');
      waldo = query.line(g.addVertex({ name: 'Ryan' }), 'waldo');
      query(g.addEdge(bob, waldo, 'likes', { since: 'now' }));

      query.script.split('\n').length.should.equal(4)
      query.exec(function(err, result) {
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
