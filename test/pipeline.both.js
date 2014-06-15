var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('.both()', function() {
    it('should append string', function() {
      var query = gremlin(g.v(1).both());
      query.script.should.equal('g.v(1).both()\n');
    });
  });
});