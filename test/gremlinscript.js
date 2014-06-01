var GremlinScript = require('../src/gremlinscript');

describe('GremlinScript', function() {
  describe('append()', function() {
    it('should append script', function() {
      var gremlin = new GremlinScript();
      gremlin.append('foo');
      gremlin.script.should.equal('foo');
    });
  });

  describe('line()', function() {
    it('should append a new line', function() {
      var gremlin = new GremlinScript();
      var g = gremlin.g;

      gremlin.line(g.v(1));
      gremlin.script.should.equal('g.v(1)\n');
    });
  });
});