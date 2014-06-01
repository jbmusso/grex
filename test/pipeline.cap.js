var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('cap', function() {
    it('should be chainable', function() {
      var query = gremlin(g.v(1).cap());
      query.script.should.equal('g.v(1).cap()');
    });
  });
});