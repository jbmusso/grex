var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('select', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).select());
      query.script.should.equal('g.v(1).select()');
    });

    it('should handle an array of strings', function() {
      var query = gremlin(g.v(1).select(['y']));
      query.script.should.equal("g.v(1).select(['y'])");
    });

    it('should handle an array of strings & 1 post-processing closure', function() {
      var query = gremlin(g.v(1).select(['y'],'{it.name}'));
      query.script.should.equal("g.v(1).select(['y']){it.name}");
    });

    it('should handle no argument & 2 post-processing closures', function() {
      var query = gremlin(g.v(1).select('{it.id}{it.name}'));
      query.script.should.equal("g.v(1).select(){it.id}{it.name}");
    });
  });
});
