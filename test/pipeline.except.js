var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;

describe('pipeline', function() {
  describe('except', function () {
    it('should chain .except()', function() {
      var query = gremlin(g.V().has('age', T.lt, 30).as('x').out('created').in('created').except('x'));

      query.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')\n");
    });
  });
});