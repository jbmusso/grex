var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('.order()', function () {
    it('should be chainable', function() {
      var query = gremlin(g.V().key('name').order());
      query.script.should.equal('g.V().name.order()\n');
    });

    it('should handle a closure', function() {
      var query = gremlin(g.V().key('name').order('{it.b <=> it.a}'));
      query.script.should.equal('g.V().name.order(){it.b <=> it.a}\n');
    });
  });
});
