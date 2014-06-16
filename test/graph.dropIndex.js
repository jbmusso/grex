var grex = require('../');
var client = grex.createClient();
var gremlin = client.gremlin;
var g = grex.g;

describe('graph', function() {
  describe('.dropIndex(String)', function() {
    it("should append string", function() {
      var query = gremlin(g.dropIndex("my-index"));
      query.script.should.equal("g.dropIndex('my-index')\n");
    });
  });
});