var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('graph', function() {
  describe('.E()', function () {
    it('should append string', function() {
      var query = gremlin(g.E());
      query.script.should.equal('g.E()\n');
    });
  });
});