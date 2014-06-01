var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var T = client.T;

describe('pipeline', function() {
  describe('orderMap', function () {
    it('should be chainable', function() {
      var query = gremlin(g.V().orderMap(T.decr));
      query.script.should.equal('g.V().orderMap(T.decr)');
    });

    it('should handle ordering token', function() {
      var query = gremlin(g.V().orderMap(T.decr));
      query.script.should.equal('g.V().orderMap(T.decr)');
    });
  });
});