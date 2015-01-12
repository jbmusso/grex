var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.fetch() - script handling', function() {
    it('should return results and response objects', function(done) {
      var client = grex.createClient();

      client.fetch(g.v(1), function(err, results, response) {
        should.not.exist(err);
        should.exist(results);
        should.exist(response);
        should.exist(response.queryTime);
        done();
      });
    });

    it('should fetch the result of a script', function(done) {
      var client = grex.createClient();

      client.fetch(g.v(1), function(err, results) {
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
});
