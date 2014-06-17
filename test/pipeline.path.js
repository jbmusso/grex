var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('path', function() {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).path());
      query.script.should.equal('g.v(1).path()\n');
    });

    it('should handle a closure argument', function() {
      var query = gremlin(g.v(1).path('{it.id}'));
      query.script.should.equal("g.v(1).path(){it.id}\n");
    });

    it('should handle a closure argument', function() {
      var query = gremlin(g.v(1).path('{it.id}{it.name}'));
      query.script.should.equal("g.v(1).path(){it.id}{it.name}\n");
    });
  });
});