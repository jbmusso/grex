var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('element', function() {
  describe('.values()', function() {
    it("should chain .values()", function() {
      var query = client.gremlin(g.v(1).values());
      query.script.should.equal("g.v(1).values()");
    });
  });
});