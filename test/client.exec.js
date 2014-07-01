var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.exec()', function() {
    describe('when port is incorrect', function() {
      var client = grex.createClient();

      before(function(done) {
        var options = {
          'host': 'localhost',
          'port': 123456,
          'graph': 'tinkergraph'
        };

        client.connect(options, function(err) {
          done();
        });
      });

      it('should return an error', function(done) {
        client.exec(gremlin(g.v(1)), function(err, results) {
          should.exist(err);
          should.not.exist(results);
          done();
        });
      });
    });

    describe('when host is incorrect', function() {
      var client = grex.createClient();

      before(function(done) {
        var options = {
          'host': 'local-host',
          'port': 8182,
          'graph': 'tinkergraph'
        };

        client.connect(options, function(err) {
          done();
        });
      });

      it('should return an error', function(done) {
        client.exec(gremlin(g.v(1)), function(err, results) {
          should.exist(err);
          should.not.exist(results);
          done();
        });
      });
    });

    describe('when graph name is incorrect', function() {
      var client = grex.createClient();

      before(function(done) {
        var options = {
          'host': 'localhost',
          'port': 8182,
          'graph': 'tinker-graph'
        };

        client.connect(options, function(err) {
          done();
        });
      });

      it('should return an error', function(done) {
        client.exec(gremlin(g.v(1)), function(err, results) {
          should.exist(err);
          should.not.exist(results);
          done();
        });
      });
    });
  });
});