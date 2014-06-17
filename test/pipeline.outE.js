var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('outE', function () {
    it('should be chainable', function () {
      var query = gremlin(g.v(1).outE());
      query.script.should.equal("g.v(1).outE()\n");
    });

    it('should handle a string argument', function () {
      var query = gremlin(g.v(1).outE('knows'));
      query.script.should.equal("g.v(1).outE('knows')\n");
    });

    it('should handle id, string arguments', function () {
      var query = gremlin(g.v(1).outE(1, 'knows'));
      query.script.should.equal("g.v(1).outE(1,'knows')\n");
    });
  });
});