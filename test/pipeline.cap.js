var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('cap', function() {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).cap());
      query.script.should.equal('g.v(1).cap()\n');
    });
  });
});