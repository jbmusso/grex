var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('transform', function () {
    it('should be chainable', function() {
      var query = gremlin(g.V().transform());
      query.script.should.equal('g.V().transform()');
    });

    it('should handle closures', function() {
      var query = gremlin(g.V().transform('{[it.id,it.age]}'));
      query.script.should.equal('g.V().transform(){[it.id,it.age]}');
    });
  });
});