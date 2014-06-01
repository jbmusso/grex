var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var Vertex = client.ClassTypes.Vertex;

describe('graph', function() {
  describe('.createIndex(string, Element.class)', function() {
    it('should handle string, Element.class arguments', function () {
      var query = gremlin(g.createIndex("my-index", Vertex));
      query.script.should.equal("g.createIndex('my-index',Vertex.class)");
    });
  });
});