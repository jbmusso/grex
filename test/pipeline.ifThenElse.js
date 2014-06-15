var client = require('../');
var gremlin = client.gremlin;
var g = client.g;

describe('pipeline', function() {
  describe('ifThenElse', function () {
    it("should chain .ifThenElse()", function() {
      var query = gremlin(g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}"));
      query.script.should.equal("g.v(1).out().ifThenElse(){it.name=='josh'}{it.age}{it.name}\n");
    });
  });
});