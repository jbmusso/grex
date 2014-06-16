var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;
var _ = grex._;
var T = grex.T;

describe('pipeline', function() {
  describe('or', function () {
    it('should chain .or() with two conditions', function() {
      var query = gremlin(g.v(1).outE().or(_().has('id', T.eq, 9), _().has('weight', T.lt, '0.6f')));

      query.script.should.equal("g.v(1).outE().or(_().has('id',T.eq,9),_().has('weight',T.lt,0.6f))\n");
    });
  });
});
