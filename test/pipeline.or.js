var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var _ = client._;
var T = client.T;

describe('pipeline', function() {
  describe('or', function () {
    it('should chain .or() with two conditions', function() {
      var query = gremlin(g.v(1).outE().or(_().has('id', T.eq, 9), _().has('weight', T.lt, '0.6f')));

      query.script.should.equal("g.v(1).outE().or(_().has('id',T.eq,9),_().has('weight',T.lt,0.6f))");
    });
  });
});
