var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.fetchOne()', function() {
    it('should fetch a single object', function(done) {
      var client = grex.createClient();

      client.fetchOne(g.v(1), function(err, vertex, response) {
        should.not.exist(err);
        should.exist(vertex); /*jshint -W030 */
        vertex.should.not.be.an.Array;
        should.exist(response);
        should.exist(response.queryTime);
        done();
      });
    });

    it('should support an object with a bound parameter', function(done) {
      var client = grex.createClient();

      client.fetchOne('g.v(vid)', { vid: 1 }, function(err, vertex, response) {
        should.not.exist(err);
        should.exist(vertex); /*jshint -W030 */
        vertex.should.not.be.an.Array;
        should.exist(response);
        should.exist(response.queryTime);
        done();
      });
    });
  });
});