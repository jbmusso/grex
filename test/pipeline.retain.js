var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('retain', function () {
    it('should handle an array of pipelines', function() {
      var query = gremlin(g.V().retain([g.v(1), g.v(2), g.v(3)]));

      query.script.should.equal("g.V().retain([g.v(1),g.v(2),g.v(3)])\n");
    });
  });
});