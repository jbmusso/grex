var grex = require('../');
var client = grex.createClient();
var gremlin = client.gremlin;
var g = grex.g;

describe('pipeline', function() {
  // Missing method
  describe.skip('shuffle', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v().shuffle());
      query.script.should.equal('g.v().shuffle()');
    });
  });
});