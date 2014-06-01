var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('graph', function() {
  describe('.idx()', function() {
    it("should handle `name, {key: value}` arguments", function() {
      var query = gremlin(g.idx("my-index", {'name':'marko'}));
      query.script.should.equal("g.idx('my-index')[[name:'marko']]");
    });

    it("should support g.idx().put()", function() {
      var query = gremlin(g.idx("my-index").put("name", "marko", g.v(1)));
      query.script.should.equal("g.idx('my-index').put('name','marko',g.v(1))");
    });
  });
});
