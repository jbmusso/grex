var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('graph', function() {
  describe('.E()', function () {
    it('should append string', function() {
      var query = gremlin(g.E());
      query.script.should.equal('g.E()\n');
    });
  });
});