var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;
var _ = grex._;

describe('pipeline', function() {
  describe('and', function () {
    it('should chain .and() with two conditions', function() {
      var query = gremlin(g.V().and(_().both("knows"), _().both("created")));

      query.script.should.equal("g.V().and(_().both('knows'),_().both('created'))\n");
    });
  });
});