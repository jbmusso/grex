var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var T = client.T;

describe('pipeline', function() {
  describe('has', function() {
    it("should handle float type argument", function() {
      var query = gremlin(g.v(1).outE().has("weight", T.gte, "0.5f"));
      query.script.should.equal("g.v(1).outE().has('weight',T.gte,0.5f)\n");
    });
  });
});