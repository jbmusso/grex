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
  });

  describe('.exec()', function() {
    describe('when port is incorrect', function() {
      it('should return an error', function(done) {
        var client = grex.createClient({
          host: 'localhost',
          port: 123456,
          graph: 'tinkergraph'
        });

        client.exec(gremlin(g.v(1)), function(err, results) {
          should.exist(err);
          should.not.exist(results);
          done();
        });
      });
    });

    describe('when host is incorrect', function() {
      it('should return an error', function(done) {
        var options = {
          'host': 'local-host',
          'port': 8182,
          'graph': 'tinkergraph'
        };
        var client = grex.createClient(options);

        client.exec(gremlin(g.v(1)), function(err, results) {
          should.exist(err);
          should.not.exist(results);
          done();
        });
      });
    });

    describe('when graph name is incorrect', function() {
      it('should return an error', function(done) {
        var options = {
          'host': 'localhost',
          'port': 8182,
          'graph': 'tinker-graph'
        };

        var client = grex.createClient(options);

        client.exec(gremlin(g.v(1)), function(err, results) {
          should.exist(err);
          should.not.exist(results);
          done();
        });
      });
    });

    describe('when passing an ObjectWrapper', function() {
      var client = grex.createClient();

      it('should lazily instantiate a GremlinScript and execute it', function() {
        client.exec(g.v(1), function(err, results) {
          should.not.exist(err);
          should.exist(results);
        });
      });
    });

    describe('when passing a query', function() {
      var client = grex.createClient();

      it('should execute it', function() {
        var query = gremlin(g.v(1));

        client.exec(query, function(err, results) {
          should.not.exist(err);
          should.exist(results);
        });
      });
    });
  });
});