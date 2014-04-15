var grex = require('../index.js');
var T = grex.T;
var Contains = grex.Contains;
var Vertex = grex.Vertex;
var Edge = grex.Edge;

var client;

before(function(done) {
  grex.connect(function(err, gremlinClient) {
    client = gremlinClient;
    done();
  });
});

describe('Gremlin steps', function() {
  describe('Transform-based steps', function() {

    describe('.V()', function () {
      it('should handle no argument', function() {
        var query = client.gremlin().g.V();
        query.gremlin.script.should.equal('g.V()');
      });

      it('should handle key, value argument', function() {
        var query = client.gremlin().g.V('name', 'marko');
        query.gremlin.script.should.equal("g.V('name','marko')");
      });
    });

    describe('.E()', function () {
      it('should handle no argument', function() {
        var query = client.gremlin().g.E();
        query.gremlin.script.should.equal("g.E()");
      });
    });

    describe('.v()', function () {
      it("should handle a numerical id", function() {
        var query = client.gremlin().g.v(1);
        query.gremlin.script.should.equal("g.v(1)");
      });

      it("should handle multiple numerical ids", function() {
        var query = client.gremlin().g.v(1, 4);
        query.gremlin.script.should.equal("g.v(1,4)");
      });

    });

    describe('.id()', function () {
      it("should be chainable", function() {
        var query = client.gremlin().g.V().id();
        query.gremlin.script.should.equal('g.V().id()');
      });
    });

    describe('.transform()', function () {
      it('should handle closures', function() {
        var query = client.gremlin().g.E().has('weight', T.gt, '0.5f').outV().transform('{[it.id,it.age]}');
        query.gremlin.script.should.equal("g.E().has('weight',T.gt,0.5f).outV().transform(){[it.id,it.age]}");
      });
    });

    describe('.select()', function () {
    /**
     * Select the named steps to emit after select with post-processing closures.
     * @see http://gremlindocs.com/#transform/select
     */
      it('should handle no argument', function() {
        var query = client.gremlin().g.v(1).as('x').out('knows').as('y').select();
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select()");
      });

      it('should handle an array of strings', function() {
        var query = client.gremlin().g.v(1).as('x').out('knows').as('y').select(["y"]);
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select(['y'])");
      });

      it('should handle an array of strings & 1 post-processing closure', function() {
        var query = client.gremlin().g.v(1).as('x').out('knows').as('y').select(["y"],"{it.name}");
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select(['y']){it.name}");
      });

      it('should handle no argument & 2 post-processing closures', function() {
        var query = client.gremlin().g.v(1).as('x').out('knows').as('y').select("{it.id}{it.name}");
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select(){it.id}{it.name}");
      });
    });

    describe('.orderMap()', function () {
      it("should handle ordering class argument", function() {
        var query = client.gremlin().g.V().both().groupCount().cap().orderMap(T.decr);
        query.gremlin.script.should.equal("g.V().both().groupCount().cap().orderMap(T.decr)");
      });
    });

    // client/JavaScript specific
    describe('.key()', function () {
      it('should chain key name', function () {
        var query = client.gremlin().g.v(1).key('name');
        query.gremlin.script.should.equal("g.v(1).name");
      });
    });
  });

  describe('Filter-based steps', function() {
    describe('[i]', function () {
      it('should chain .index(i) as [i]', function() {
        var query = client.gremlin().g.V().index(0).property('name');
        query.gremlin.script.should.equal("g.V()[0].property('name')");
      });
    });

    describe('[i...i]', function () {
      it('should chain .range() as [i..j]', function() {
        var query = client.gremlin().g.V().range('0..<2').property('name');
        query.gremlin.script.should.equal("g.V()[0..<2].property('name')");
      });
    });

    describe('.and()', function () {
      it('should chain .and() with two conditions', function() {
        var gremlin = client.gremlin();
        var query = gremlin.g.V().and(gremlin._().both("knows"), gremlin._().both("created"));

        query.gremlin.script.should.equal("g.V().and(_().both('knows'),_().both('created'))");
      });
    });

    describe('.or()', function () {
      it('should chain .or() with two conditions', function() {
        var gremlin = client.gremlin();
        var query = gremlin.g.v(1).outE().or(gremlin._().has('id', T.eq, 9), gremlin._().has('weight', T.lt, '0.6f'));

        query.gremlin.script.should.equal("g.v(1).outE().or(_().has('id',T.eq,9),_().has('weight',T.lt,0.6f))");
      });
    });

    describe('.retain()', function () {
      it('should handle an array of pipelines', function() {
        var gremlin = client.gremlin();
        var query = gremlin.g.V().retain([gremlin.g.v(1), gremlin.g.v(2), gremlin.g.v(3)]);

        query.gremlin.script.should.equal("g.V().retain([g.v(1),g.v(2),g.v(3)])");
      });
    });

    describe('.except()', function () {
      it('should chain .except()', function() {
        var query = client.gremlin().g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x');

        query.gremlin.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')");
      });
    });

    describe('.has()', function() {
      it("should handle float type argument", function() {
        var query = client.gremlin().g.v(1).outE().has("weight", T.gte, "0.5f");
        query.gremlin.script.should.equal("g.v(1).outE().has('weight',T.gte,0.5f)");
      });
    });
  });

  describe('SideEffect-based steps', function() {
    describe('.gather()', function () {
      it("should handle a closure", function() {
        var query = client.gremlin().g.v(1).out().gather("{it.size()}");
        query.gremlin.script.should.equal("g.v(1).out().gather(){it.size()}");
      });
    });
  });

  describe('Branch-based steps', function() {
    describe('.copySplit()', function () {
      it("should chain .copySplit()", function() {
        var gremlin = client.gremlin();
        var query = gremlin.g.v(1).out('knows').copySplit(gremlin._().out('created').property('name'), gremlin._().property('age')).fairMerge();
        query.gremlin.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').property('name'),_().property('age')).fairMerge()");
      });
    });

    describe('.exhaustMerge', function () {
      it('should chain .exhaustMerge()', function () {
        var gremlin = client.gremlin();
        var query = gremlin.g.v(1).out('knows').copySplit(gremlin._().out('created').key('name'), gremlin._().key('age')).exhaustMerge();

        query.gremlin.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').name,_().age).exhaustMerge()");
      });
    });

    describe('.ifThenElse()', function () {
      it("should chain .ifThenElse()", function() {
        var query = client.gremlin().g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
        query.gremlin.script.should.equal("g.v(1).out().ifThenElse(){it.name=='josh'}{it.age}{it.name}");
      });
    });
  });
});
