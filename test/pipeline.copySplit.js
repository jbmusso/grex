var grex = require('../');
var gremlin = grex.gremlin;
var g = grex.g;
var _ = grex._;

describe('pipeline', function() {
  describe('copySplit', function () {
    it("should chain .copySplit()", function() {
      var query = gremlin(g.v(1).out('knows').copySplit(_().out('created').property('name'), _().property('age')).fairMerge());
      query.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').property('name'),_().property('age')).fairMerge()\n");
    });
  });
});