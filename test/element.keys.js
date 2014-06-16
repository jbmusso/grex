var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('element', function() {
  describe('.keys()', function() {
    it("should chain .keys()", function() {
      var query = gremlin(g.v(1).keys());
      query.script.should.equal("g.v(1).keys()\n");
    });
  });
});