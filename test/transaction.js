var should = require('should');

var grex = require('../');
var bind = grex.bindParameter;
var g = grex.g;
var gremlin = grex.gremlin;


function cleanGraph(done) {
  var client = grex.createClient();
  var query = gremlin();

  query(g.V('name', 'Alice').remove());
  query(g.V('name', 'Bob').remove());
  query(g.V('name', 'Carol').remove());
  query(g.V('name', 'Eve').remove());
  query(g.V('name', 'John').remove());
  query(g.V('name', 'Waldo').remove());

  client.execute(query, function(err, results) {
    done();
  });
}

describe('Transactions', function() {
  afterEach(cleanGraph);

  it('should add a vertex to the graph', function(done) {
    var client = grex.createClient();
    var query = gremlin(g.addVertex({ name: "Alice" }));

    client.execute(query, function(err, result) {
      should.not.exist(err);
      result.should.have.property('success', true);
      done();
    });
  });

  it('should add a vertex with bound properties to the graph', function(done) {
    var client = grex.createClient();
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
    var client = grex.createClient();
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
    var client = grex.createClient();
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
