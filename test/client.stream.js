var should = require('should');

var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;



describe('client', function() {
  describe('.stream()', function() {
    it('should return a stream', function(done) {
      var client = grex.createClient();

      var s = client.stream(gremlin(g.v(1)));

      s.on('data', function(vertex) {
        vertex._id.should.equal('1');
        vertex._type.should.equal('vertex');
        vertex.name.should.equal('marko');
        vertex.age.should.equal(29);
      });

      s.on('end', function() {
        done();
      });
    });
  });
});