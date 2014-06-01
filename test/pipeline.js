var grex = require('../index.js');
var T = grex.T;
var Contains = grex.Contains;
var Vertex = grex.Vertex;
var Edge = grex.Edge;

var client;
var g;
var _;
var gremlin;

before(function(done) {
  grex.connect(function(err, rexsterClient) {
    client = rexsterClient;
    gremlin = client.gremlin;
    g = client.g;
    _ = client._;
    done();
  });
});

describe('Gremlin steps', function() {
  describe('Transform-based steps', function() {
    describe('both', function() {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).both());
        query.script.should.equal('g.v(1).both()');
      });
    });

    describe('bothE', function() {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).bothE());
        query.script.should.equal('g.v(1).bothE()');
      });
    });

    describe('bothV', function() {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).bothV());
        query.script.should.equal('g.v(1).bothV()');
      });
    });

    describe('cap', function() {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).cap());
        query.script.should.equal('g.v(1).cap()');
      });
    });

    describe('E', function () {
      it('should be chainable', function() {
        var query = gremlin(g.E());
        query.script.should.equal('g.E()');
      });
    });

    describe('gather', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).out().gather());
        query.script.should.equal('g.v(1).out().gather()');
      });

      it('should handle a closure', function() {
        var query = gremlin(g.v(1).out().gather('{it.size()}'));
        query.script.should.equal('g.v(1).out().gather(){it.size()}');
      });
    });

    describe('id', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).in());
        query.script.should.equal('g.v(1).in()');
      });
    });

    describe('in', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).id());
        query.script.should.equal('g.v(1).id()');
      });
    });

    describe('inE', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).inE());
        query.script.should.equal('g.v(1).inE()');
      });
    });

    describe('inV', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).inV());
        query.script.should.equal('g.v(1).inV()');
      });
    });

    // client/JavaScript specific
    describe('key', function () {
      it('should be chainable', function () {
        var query = gremlin(g.v(1).key('name'));
        query.script.should.equal('g.v(1).name');
      });
    });

    describe('map', function () {
      it('should be chainable', function () {
        var query = gremlin(g.v(1).map());
        query.script.should.equal('g.v(1).map()');
      });
    });

    describe('memoize', function () {
      it('should be chainable', function () {
        var query = gremlin(g.V().memoize());
        query.script.should.equal('g.V().memoize()');
      });

      it('should handle numerical argument', function () {
        var query = gremlin(g.V().memoize(1));
        query.script.should.equal('g.V().memoize(1)');
      });
    });

    describe('order', function () {
      it('should be chainable', function() {
        var query = gremlin(g.V().key('name').order());
        query.script.should.equal('g.V().name.order()');
      });

      it('should handle a closure', function() {
        var query = gremlin(g.V().key('name').order('{it.b <=> it.a}'));
        query.script.should.equal('g.V().name.order(){it.b <=> it.a}');
      });
    });

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

    describe('out', function () {
      it('should be chainable', function () {
        var query = gremlin(g.v(1).out());
        query.script.should.equal('g.v(1).out()');
      });

      it('should handle string argument', function () {
        var query = gremlin(g.v(1).out('knows'));
        query.script.should.equal("g.v(1).out('knows')");
      });

      it('should handle id, string arguments', function () {
        var query = gremlin(g.v(1).out(1, 'knows'));
        query.script.should.equal("g.v(1).out(1,'knows')");
      });
    });

    describe('outE', function () {
      it('should be chainable', function () {
        var query = gremlin(g.v(1).outE());
        query.script.should.equal("g.v(1).outE()");
      });

      it('should handle a string argument', function () {
        var query = gremlin(g.v(1).outE('knows'));
        query.script.should.equal("g.v(1).outE('knows')");
      });

      it('should handle id, string arguments', function () {
        var query = gremlin(g.v(1).outE(1, 'knows'));
        query.script.should.equal("g.v(1).outE(1,'knows')");
      });
    });

    describe('outV', function() {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).outV());
        query.script.should.equal('g.v(1).outV()');
      });
    });

    describe('path', function() {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).path());
        query.script.should.equal('g.v(1).path()');
      });

      it('should handle a closure argument', function() {
        var query = gremlin(g.v(1).path('{it.id}'));
        query.script.should.equal("g.v(1).path(){it.id}");
      });

      it('should handle a closure argument', function() {
        var query = gremlin(g.v(1).path('{it.id}{it.name}'));
        query.script.should.equal("g.v(1).path(){it.id}{it.name}");
      });
    });

    describe('scatter', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v().scatter());
        query.script.should.equal('g.v().scatter()');
      });
    });

    describe('select', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v(1).select());
        query.script.should.equal('g.v(1).select()');
      });

      it('should handle an array of strings', function() {
        var query = gremlin(g.v(1).select(['y']));
        query.script.should.equal("g.v(1).select(['y'])");
      });

      it('should handle an array of strings & 1 post-processing closure', function() {
        var query = gremlin(g.v(1).select(['y'],'{it.name}'));
        query.script.should.equal("g.v(1).select(['y']){it.name}");
      });

      it('should handle no argument & 2 post-processing closures', function() {
        var query = gremlin(g.v(1).select('{it.id}{it.name}'));
        query.script.should.equal("g.v(1).select(){it.id}{it.name}");
      });
    });

    describe.skip('shuffle', function () {
      // Missing method
      it('should be chainable', function() {
        var query = gremlin(g.v().shuffle());
        query.script.should.equal('g.v().shuffle()');
      });
    });

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

    describe('v', function () {
      it("should handle a numerical id", function() {
        var query = gremlin(g.v(1));
        query.script.should.equal("g.v(1)");
      });

      it("should handle multiple numerical ids", function() {
        var query = gremlin(g.v(1, 4, 3));
        query.script.should.equal("g.v(1,4,3)");
      });
    });

    describe('V', function () {
      it('should be chainable', function() {
        var query = gremlin(g.v());
        query.script.should.equal('g.v()');
      });

      it('should handle key, value argument', function() {
        var query = gremlin(g.V('name', 'marko'));
        query.script.should.equal("g.V('name','marko')");
      });
    });
  });

  describe('Filter-based steps', function() {
    describe('[i]', function () {
      it('should chain .index(i) as [i]', function() {
        var query = gremlin(g.V().index(0).property('name'));
        query.script.should.equal("g.V()[0].property('name')");
      });
    });

    describe('[i...i]', function () {
      it('should chain .range() as [i..j]', function() {
        var query = gremlin(g.V().range('0..<2').property('name'));
        query.script.should.equal("g.V()[0..<2].property('name')");
      });
    });

    describe('and', function () {
      it('should chain .and() with two conditions', function() {
        var query = gremlin(g.V().and(_().both("knows"), _().both("created")));

        query.script.should.equal("g.V().and(_().both('knows'),_().both('created'))");
      });
    });

    describe('or', function () {
      it('should chain .or() with two conditions', function() {
        var query = gremlin(g.v(1).outE().or(_().has('id', T.eq, 9), _().has('weight', T.lt, '0.6f')));

        query.script.should.equal("g.v(1).outE().or(_().has('id',T.eq,9),_().has('weight',T.lt,0.6f))");
      });
    });

    describe('retain', function () {
      it('should handle an array of pipelines', function() {
        var query = gremlin(g.V().retain([g.v(1), g.v(2), g.v(3)]));

        query.script.should.equal("g.V().retain([g.v(1),g.v(2),g.v(3)])");
      });
    });

    describe('except', function () {
      it('should chain .except()', function() {
        var query = gremlin(g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x'));

        query.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')");
      });
    });

    describe('has', function() {
      it("should handle float type argument", function() {
        var query = gremlin(g.v(1).outE().has("weight", T.gte, "0.5f"));
        query.script.should.equal("g.v(1).outE().has('weight',T.gte,0.5f)");
      });
    });
  });

  describe('Branch-based steps', function() {
    describe('copySplit', function () {
      it("should chain .copySplit()", function() {
        var query = gremlin(g.v(1).out('knows').copySplit(_().out('created').property('name'), _().property('age')).fairMerge());
        query.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').property('name'),_().property('age')).fairMerge()");
      });
    });

    describe('exhaustMerge', function () {
      it('should chain .exhaustMerge()', function () {
        var query = gremlin(g.v(1).out('knows').copySplit(_().out('created').key('name'), _().key('age')).exhaustMerge());

        query.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').name,_().age).exhaustMerge()");
      });
    });

    describe('ifThenElse', function () {
      it("should chain .ifThenElse()", function() {
        var query = gremlin(g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}"));
        query.script.should.equal("g.v(1).out().ifThenElse(){it.name=='josh'}{it.age}{it.name}");
      });
    });
  });
});
