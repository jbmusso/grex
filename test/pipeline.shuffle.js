var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  // Missing method
  describe.skip('shuffle', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v().shuffle());
      query.script.should.equal('g.v().shuffle()');
    });
  });
});