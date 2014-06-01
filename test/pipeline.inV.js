var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('inV', function () {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).inV());
      query.script.should.equal('g.v(1).inV()');
    });
  });
});