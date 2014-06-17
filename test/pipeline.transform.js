var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('transform', function () {
    it('should be chainable', function() {
      var query = gremlin(g.V().transform());
      query.script.should.equal('g.V().transform()\n');
    });

    it('should handle closures', function() {
      var query = gremlin(g.V().transform('{[it.id,it.age]}'));
      query.script.should.equal('g.V().transform(){[it.id,it.age]}\n');
    });
  });
});