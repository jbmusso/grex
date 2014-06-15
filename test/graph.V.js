var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('graph', function() {
  describe('.V(key, value)', function () {
    it('should append string', function() {
      var query = gremlin(g.V('name', 'marko'));
      query.script.should.equal("g.V('name','marko')\n");
    });
  });

  describe.skip('.V({ key: value })', function () {
    it('should append string', function() {
      var query = gremlin(g.V({ name: 'marko' }));
      query.script.should.equal("g.V('name','marko')\n");
    });
  });
});
