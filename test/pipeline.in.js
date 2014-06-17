var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('.in()', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).in());
      query.script.should.equal('g.v(1).in()\n');
    });
  });
});