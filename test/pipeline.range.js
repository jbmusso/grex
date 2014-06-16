var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('[i...i]', function () {
    it('should chain .range() as [i..j]', function() {
      var query = gremlin(g.V().range('0..<2').property('name'));
      query.script.should.equal("g.V()[0..<2].property('name')\n");
    });
  });
});