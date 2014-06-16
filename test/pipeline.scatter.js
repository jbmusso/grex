var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('scatter', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v().scatter());
      query.script.should.equal('g.v().scatter()\n');
    });
  });
});