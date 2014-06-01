var client = require('../');
var Gremlin = require('../src/gremlinscript');
var Vertex = client.Vertex;

describe('element', function() {
    describe('.setProperty()', function() {
    it('should set property', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');

      gremlin.line(v.setProperty('name', 'bob'));
      v.should.have.property('name', 'bob');
      gremlin.script.should.equal("v.setProperty('name','bob')\n");
    });
  });
});
