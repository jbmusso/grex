var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('memoize', function () {
    it('should be chainable', function () {
      var query = gremlin(g.V().memoize());
      query.script.should.equal('g.V().memoize()\n');
    });

    it('should handle numerical argument', function () {
      var query = gremlin(g.V().memoize(1));
      query.script.should.equal('g.V().memoize(1)\n');
    });
  });
});