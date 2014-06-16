var grex = require('../');
var client = grex.createClient();
var gremlin = client.gremlin;
var g = grex.g;

describe('element', function() {
  describe('.keys()', function() {
    it("should chain .keys()", function() {
      var query = gremlin(g.v(1).keys());
      query.script.should.equal("g.v(1).keys()\n");
    });
  });
});