var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('map', function () {
    it('should be chainable', function () {
      var query = gremlin(g.v(1).map());
      query.script.should.equal('g.v(1).map()\n');
    });
  });
});