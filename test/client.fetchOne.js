var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe.only('.fetchOne()', function() {
    it('should fetch a single object', function(done) {
      var client = grex.createClient();

      client.fetchOne(g.v(1), function(err, vertex) {
        should.not.exist(err);
        should.exist(vertex); /*jshint -W030 */
        vertex.should.not.be.an.Array;
        done();
      });
    });
  });
});