var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('out', function () {
    it('should be chainable', function () {
      var query = gremlin(g.v(1).out());
      query.script.should.equal('g.v(1).out()');
    });

    it('should handle string argument', function () {
      var query = gremlin(g.v(1).out('knows'));
      query.script.should.equal("g.v(1).out('knows')");
    });

    it('should handle id, string arguments', function () {
      var query = gremlin(g.v(1).out(1, 'knows'));
      query.script.should.equal("g.v(1).out(1,'knows')");
    });
  });
});