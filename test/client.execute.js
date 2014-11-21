var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.execute()', function() {
    it('should execute a script', function() {
      var client = grex.createClient();

      client.execute(gremlin(g.v(1)), function(err, response) {
        should.not.exist(err);
        should.exist(response.results);
      });
    });

    it('should automatically instantiate a GremlinScript and execute it', function() {
      var client = grex.createClient();
      client.execute(g.v(1), function(err, results) {
        should.not.exist(err);
        should.exist(results);
      });
    });

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