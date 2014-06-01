var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var _ = client._;

describe('pipeline', function() {
  describe('and', function () {
    it('should chain .and() with two conditions', function() {
      var query = gremlin(g.V().and(_().both("knows"), _().both("created")));

      query.script.should.equal("g.V().and(_().both('knows'),_().both('created'))");
    });
  });
});