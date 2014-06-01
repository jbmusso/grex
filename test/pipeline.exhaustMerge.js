var client = require('../');
var gremlin = client.gremlin;
var g = client.g;
var _ = client._;

describe('pipeline', function() {
  describe('exhaustMerge', function () {
    it('should chain .exhaustMerge()', function () {
      var query = gremlin(g.v(1).out('knows').copySplit(_().out('created').key('name'), _().key('age')).exhaustMerge());

      query.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').name,_().age).exhaustMerge()");
    });
  });
});