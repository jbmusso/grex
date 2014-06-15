var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var T = client.T;

describe('pipeline', function() {
  describe('except', function () {
    it('should chain .except()', function() {
      var query = gremlin(g.V().has('age', T.lt, 30).as('x').out('created').in('created').except('x'));

      query.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')\n");
    });
  });
});