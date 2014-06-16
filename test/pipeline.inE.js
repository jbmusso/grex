var grex = require('../');
var client = grex.createClient();
var gremlin = client.gremlin;
var g = grex.g;

describe('pipeline', function() {
  describe('inE', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).inE());
      query.script.should.equal('g.v(1).inE()\n');
    });
  });
});