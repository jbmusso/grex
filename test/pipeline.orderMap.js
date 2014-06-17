var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;
var T = grex.T;

describe('pipeline', function() {
  describe('orderMap', function () {
    it('should be chainable', function() {
      var query = gremlin(g.V().orderMap(T.decr));
      query.script.should.equal('g.V().orderMap(T.decr)\n');
    });

    it('should handle ordering token', function() {
      var query = gremlin(g.V().orderMap(T.decr));
      query.script.should.equal('g.V().orderMap(T.decr)\n');
    });
  });
});