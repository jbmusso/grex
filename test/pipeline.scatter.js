var grex = require('../');
var client = grex.createClient();
var gremlin = client.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('scatter', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v().scatter());
      query.script.should.equal('g.v().scatter()\n');
    });
  });
});