var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  // client/JavaScript specific
  describe('key', function () {
    it('should be chainable', function () {
      var query = gremlin(g.v(1).key('name'));
      query.script.should.equal('g.v(1).name');
    });
  });
});