var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;

var Vertex = grex.Vertex;

describe('graph', function() {
  describe('.createIndex(string, Element.class)', function() {
    it('should handle string, Element.class arguments', function () {
      var query = gremlin(g.createIndex("my-index", Vertex));
      query.script.should.equal("g.createIndex('my-index',Vertex.class)\n");
    });
  });
});