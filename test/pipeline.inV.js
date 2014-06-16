var grex = require('../');
var client = grex.createClient();
var gremlin = client.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('inV', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).inV());
      query.script.should.equal('g.v(1).inV()\n');
    });
  });
});