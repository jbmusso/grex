var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('element', function() {
  describe('.values()', function() {
    it("should chain .values()", function() {
      var query = gremlin(g.v(1).values());
      query.script.should.equal("g.v(1).values()\n");
    });
  });
});