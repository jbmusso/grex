var gRex = require('../index.js');

var defaultOptions = {
    'host': 'localhost',
    'port': 8182,
    'graph': 'tinkergraph',
    'idRegex': false // OrientDB id regex -> /^[0-9]+:[0-9]+$/
  };



describe('gRex Client', function() {


  describe('when passing no parameters', function() {
    it('should use defaults options', function(done) {
      gRex.connect()
      .then(function(client) {
        client.options.should.eql(defaultOptions);
        done();
      })
      .fail(function(error) {
        console.error(error);
      });
    });  
  });


  describe('when using custom options', function() {
    it('should use this new options', function(done) {
      var options = {
        host: 'localhost',
        port: 8182,
        graph: 'graph',
        idRegex: false
      };

      gRex.connect(options)
      .then(function(client) {
        client.options.graph.should.equal(options.graph);
        done();
      })
      .fail(function(error) {
        console.error(error);
      });
    });
  });

});
