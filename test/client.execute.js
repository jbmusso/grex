var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.execute() - script handling', function() {
    it('should execute a script', function(done) {
      var client = grex.createClient();

      client.execute(gremlin(g.v(1)), function(err, response) {
        should.not.exist(err);
        should.exist(response.results);
        done();
      });
    });

    it('should automatically instantiate a GremlinScript and execute it', function(done) {
      var client = grex.createClient();
      client.execute(g.v(1), function(err, results) {
        should.not.exist(err);
        should.exist(results);
        done();
      });
    });

    it('should execute a stored script', function(done) {
      var client = grex.createClient({
        load: ['vertices']
      });

      client.execute(gremlin('allVertices()'), function(err, results) {
        should.not.exist(err);
        should.exist(results);
        done();
      });
    });
  });

  describe('.execute() - bound parameters', function() {
    it('should handle an object passed as an argument', function(done) {
      var client = grex.createClient();
      var query = gremlin('return %s', { foo: "bar", baz: 1 });

      client.execute(query, function(err, response) {
        should.not.exist(err);
        var result = response.results[0];
        result.foo.should.equal('bar');
        result.baz.should.equal(1);
        done();
      });
    });

    it('should handling an Array of Objects', function(done) {
      var client = grex.createClient();
      var query = gremlin('return %s', [{ foo: "bar", baz: 1 }, { baz: "duh", boo: true }]);

      client.execute(query, function(err, response) {
        should.not.exist(err);
        var results = response.results;
        results[0].foo.should.equal('bar');
        results[0].baz.should.equal(1);
        results[1].baz.should.equal('duh');
        results[1].boo.should.equal(true);
        done();
      });
    });
  });

  describe('.execute() - error handling', function() {
    it('should return an error when port is incorrect', function(done) {
      var client = grex.createClient({
        host: 'localhost',
        port: 123456,
        graph: 'tinkergraph'
      });

      client.execute(gremlin(g.v(1)), function(err, results) {
        should.exist(err);
        should.not.exist(results);
        done();
      });
    });

    it('should return an error when host is incorrect', function(done) {
      var options = {
        'host': 'local-host',
        'port': 8182,
        'graph': 'tinkergraph'
      };
      var client = grex.createClient(options);

      client.execute(gremlin(g.v(1)), function(err, results) {
        should.exist(err);
        should.not.exist(results);
        done();
      });
    });

    it('should return an error when graph name is incorrect', function(done) {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'tinker-graph'
      };

      var client = grex.createClient(options);

      client.execute(gremlin(g.v(1)), function(err, results) {
        should.exist(err);
        should.not.exist(results);
        done();
      });
    });
  });
});