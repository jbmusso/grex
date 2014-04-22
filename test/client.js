var should = require('should');

var grex = require('../index.js');
var _    = require("lodash");
var RexsterClient = require('../src/rexsterclient.js');


var defaultOptions = {
  'host': 'localhost',
  'port': 8182,
  'graph': 'tinkergraph'
};


describe('RexsterClient', function() {
  describe('when passing no parameters', function() {
    it('should use default options', function(done) {
      grex.connect(function(err, client) {
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
      grex.connect(options, function(err, client) {
        done();
      });
    });

    it('should use this new options', function(done) {
      grex.options.graph.should.equal(options.graph);
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
      var client = new RexsterClient(options);
      client.options.graph.should.equal(options.graph);
      done();
    });
  });
});