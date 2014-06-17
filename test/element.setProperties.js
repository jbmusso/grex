var client = require('../');
var Gremlin = require('../src/gremlinscript');
var Vertex = client.Vertex;

describe('element', function() {
  describe('.setProperties()', function() {
    it('should set properties', function() {
      var gremlin = new Gremlin(client);
      var v = new Vertex('v');
      gremlin.handleHelper(v.setProperties({
        'foo': 'bar',
        'baz': 'duh'
      }));
      v.should.have.property('foo', 'bar');
      v.should.have.property('baz', 'duh');

      gremlin.script.should.equal('v.setProperties(["foo":"bar","baz":"duh"])\n');
    });
  });
});