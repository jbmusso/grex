var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;

describe('pipeline', function() {
  describe('has', function() {
    it("should handle float type argument", function() {
      var query = gremlin(g.v(1).outE().has("weight", T.gte, "0.5f"));
      query.script.should.equal("g.v(1).outE().has('weight',T.gte,0.5f)\n");
    });
  });
});