var should = require('should');

var grex = require('../');
var client = grex.createClient();
var bind = grex.bindParameter;
var g = grex.g;
var gremlin = grex.gremlin;


describe('Transactions', function() {
  it('should add a vertex to the graph', function(done) {
    var query = gremlin(g.addVertex({ name: "Alice" }));

    client.execute(query, function(err, result) {
      should.not.exist(err);
      result.should.have.property('success', true);
      done();
    });
  });

  it('should add a vertex with bound properties to the graph', function(done) {
    var query = gremlin(g.addVertex(bind({ name: "Eve" })));

    query.script.should.equal('g.addVertex(p0)\n');
    query.params.p0.name.should.equal('Eve');

    client.execute(query, function(err, result) {
      should.not.exist(err);
      result.should.have.property('success', true);
      done();
    });
  });

  it('should add two vertices and an edge in a transaction', function(done) {
    var query = gremlin();
    var bob = query.var(g.addVertex({ name: 'Bob' }));
    var waldo = query.var(g.addVertex({ name: 'Waldo' }));

    query(g.addEdge(bob, waldo, 'likes', { since: 'now' }));

    query.script.split('\n').length.should.equal(4);
    client.execute(query, function(err, result) {
      should.not.exist(err);
      result.should.have.property('success', true);
      done();
    });
  });

  it('should add two vertices and an edge with bound properties', function(done) {
    var query = gremlin();
    var john = query.var(g.addVertex(bind({ name: 'John' })));
    var carol = query.var(g.addVertex(bind({ name: 'Carol' })));
    query(g.addEdge(john, carol, 'knows', bind({ since: 'now' })));

    query.script.split('\n').length.should.equal(4);
    client.execute(query, function(err, result) {
      should.not.exist(err);
      result.should.have.property('success', true);
      done();
    });
  });
});
