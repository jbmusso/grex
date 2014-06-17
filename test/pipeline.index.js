var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('[i]', function () {
    it('should chain .index(i) as [i]', function() {
      var query = gremlin(g.V().index(0).property('name'));
      query.script.should.equal("g.V()[0].property('name')\n");
    });
  });
});
