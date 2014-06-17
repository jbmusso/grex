var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('gather', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).out().gather());
      query.script.should.equal('g.v(1).out().gather()\n');
    });

    it('should handle a closure', function() {
      var query = gremlin(g.v(1).out().gather('{it.size()}'));
      query.script.should.equal('g.v(1).out().gather(){it.size()}\n');
    });
  });
});