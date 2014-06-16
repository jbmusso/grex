var should = require('should');

var grex = require('../');
var client = grex.createClient();
var client;

var defaultOptions = {
  'host': 'localhost',
  'port': 8182,
  'graph': 'tinkergraph'
};

describe('client', function() {
  describe('.connect()', function() {
    describe('when passing no parameters', function() {
      it('should use default options', function(done) {
        client.connect(function(err, rexsterClient) {
          should.not.exist(err);
          client.options.should.eql(defaultOptions);
          done();
        });
      });
    });

    describe('when passing custom options', function() {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'gratefulgraph'
      };

      before(function(done) {
        client.connect(options, function(err, client) {
          done();
        });
      });

      it('should use this new options', function(done) {
        client.options.graph.should.equal(options.graph);
        done();
      });
    });

    describe('when instantiating a client with custom options', function() {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'gratefulgraph'
      };

      it('should use the right options', function(done) {
        var client = grex.createClient(options);
        client.options.graph.should.equal(options.graph);
        done();
      });
    });
  });
});
