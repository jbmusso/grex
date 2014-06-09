var client = require('../');
var Gremlin = require('../src/gremlinscript');
var Vertex = client.Vertex;

describe('element', function() {
  describe('.addProperty()', function() {
    it('should add property', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');

      gremlin.handleHelper(v.addProperty('name', 'alice'));
      v.should.have.property('name', 'alice');
      gremlin.script.should.equal("v.addProperty('name','alice')\n");
    });
  });
});