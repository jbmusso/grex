var client = require('../index.js');
var _    = require("lodash");
var Client = require('../src/client.js');


var defaultOptions = {
  'host': 'localhost',
  'port': 8182,
  'graph': 'tinkergraph',
  'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
};


describe('Client connection', function() {
  describe('when passing no parameters', function() {
    it('should use default options', function(done) {
      client.connect()
      .then(function(client) {
        client.options.should.eql(defaultOptions);
        done();
      })
      .fail(function(error) {
        console.error(error);
        done();
      });
    });
  });

  describe('when passing custom options', function() {
    var options = {
      'host': 'localhost',
      'port': 8182,
      'graph': 'gratefulgraph',
      'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
    };

    before(function(done) {
      client.connect(options)
      .then(function(client) {
        done();
      })
      .fail(function(error) {
        console.error(error);
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
      'graph': 'gratefulgraph',
      'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
    };

    it('should use the right options', function(done) {
      var client = new Client(options);
      client.options.graph.should.equal(options.graph);
      done();
    });
  });
});