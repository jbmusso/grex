var client = require('../');
var Gremlin = require('../src/gremlinscript');
var Vertex = client.Vertex;

describe('element', function() {
  describe('.remove()', function() {
    it('should remove element', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');

      gremlin.handleHelper(v.remove());
      gremlin.script.should.equal('v.remove()\n');
    });
  });
});