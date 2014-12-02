var should = require('should');

var grex = require('../');

describe('gRex', function() {
  describe('.createClient()', function() {
    describe('when passing no parameters', function() {
      var defaultOptions = {
        host: 'localhost',
        port: 8182,
        graph: 'tinkergraph',
        load: [],
        showTypes: false
      };

      it('should use default options', function() {
        var client = grex.createClient();
        client.options.should.eql(defaultOptions);
      });
    });

    describe('when passing custom options', function() {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'gratefulgraph'
      };

      it('should use this new options', function() {
        var client = grex.createClient(options);
        client.options.graph.should.equal(options.graph);
      });
    });

    describe('when instantiating a client with custom options', function() {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'gratefulgraph'
      };

      it('should use the right options', function() {
        var client = grex.createClient(options);
        client.options.graph.should.equal(options.graph);
      });
    });
  });
});
