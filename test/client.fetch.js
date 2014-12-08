var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.fetch() - script handling', function() {
    it('should fetch the resulf of a script', function(done) {
      var client = grex.createClient();

      client.fetch(gremlin(g.v(1)), function(err, results) {
        should.not.exist(err);
        should.exist(results);
        done();
      });
    });

    it('should automatically instantiate a GremlinScript and fetch the results of executing it', function(done) {
      var client = grex.createClient();
      client.fetch(g.v(1), function(err, results) {
        should.not.exist(err);
        should.exist(results);
        done();
      });
    });

    it('should execute a stored script', function(done) {
      var client = grex.createClient({
        load: ['vertices']
      });

      client.fetch(gremlin('allVertices()'), function(err, results) {
        should.not.exist(err);
        should.exist(results);
        done();
      });
    });
  });

  describe('.fetch() - bound parameters', function() {
    it('should handle an object passed as an argument', function(done) {
      var client = grex.createClient();
      var query = gremlin('return %s', { foo: "bar", baz: 1 });

      client.fetch(query, function(err, results) {
        should.not.exist(err);
        var result = results[0];
        result.foo.should.equal('bar');
        result.baz.should.equal(1);
        done();
      });
    });

    it('should handle an Array of Objects', function(done) {
      var client = grex.createClient();
      var query = gremlin('return %s', [{ foo: "bar", baz: 1 }, { baz: "duh", boo: true }]);

      client.fetch(query, function(err, results) {
        should.not.exist(err);
        results[0].foo.should.equal('bar');
        results[0].baz.should.equal(1);
        results[1].baz.should.equal('duh');
        results[1].boo.should.equal(true);
        done();
      });
    });
  });

  describe('.fetch() - error handling', function() {
    it('should return an error when port is incorrect', function(done) {
      var client = grex.createClient({
        host: 'localhost',
        port: 123456,
        graph: 'tinkergraph'
      });

      client.fetch(gremlin(g.v(1)), function(err, results) {
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

      client.fetch(gremlin(g.v(1)), function(err, results) {
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

      client.fetch(gremlin(g.v(1)), function(err, results) {
        should.exist(err);
        should.not.exist(results);
        done();
      });
    });
  });
});
