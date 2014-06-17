var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('graph', function() {
  describe('.dropIndex(String)', function() {
    it("should append string", function() {
      var query = gremlin(g.dropIndex("my-index"));
      query.script.should.equal("g.dropIndex('my-index')\n");
    });
  });
});