var gRex = require('../index.js'),
  T = gRex.T,
  Contains = gRex.Contains,
  Vertex = gRex.Vertex,
  Edge = gRex.Edge;

var gRex;

before(function(done) {
  gRex.connect()
    .then(function(result) {
      gRex = result;
      done();
    })
    .fail(function(error) {
      console.error(error);
    });
});

describe('Gremlin steps', function() {
  describe('Transform-based steps', function() {

    describe('.V()', function () {
      it('should handle no argument', function() {
        var query = gRex.gremlin().g.V();
        query.gremlin.script.should.equal('g.V()');
      });

      it('should handle key, value argument', function() {
        var query = gRex.gremlin().g.V('name', 'marko');
        query.gremlin.script.should.equal("g.V('name','marko')");
      });
    });

    describe('.E()', function () {
      it('should handle no argument', function() {
        var query = gRex.gremlin().g.E();
        query.gremlin.script.should.equal("g.E()");
      });
    });

    describe('.v()', function () {
      it("should handle a numerical id", function() {
        var query = gRex.gremlin().g.v(1);
        query.gremlin.script.should.equal("g.v(1)");
      });

      it("should handle multiple numerical ids", function() {
        var query = gRex.gremlin().g.v(1, 4);
        query.gremlin.script.should.equal("g.v(1,4)");
      });

    });

    describe('.id()', function () {
      it("should be chainable", function() {
        var query = gRex.gremlin().g.V().id();
        query.gremlin.script.should.equal('g.V().id()');
      });
    });

    describe('.transform()', function () {
      it('should handle closures', function() {
        var query = gRex.gremlin().g.E().has('weight', T.gt, '0.5f').outV().transform('{[it.id,it.age]}');
        query.gremlin.script.should.equal("g.E().has('weight',T.gt,0.5f).outV().transform(){[it.id,it.age]}");
      });
    });

    describe('.select()', function () {
    /**
     * Select the named steps to emit after select with post-processing closures.
     * @see http://gremlindocs.com/#transform/select
     */
      it('should handle no argument', function() {
        var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select();
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select()");
      });

      it('should handle an array of strings', function() {
        var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select(["y"]);
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select([\"y\"])");
      });

      it('should handle an array of strings & 1 post-processing closure', function() {
        var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select(["y"],"{it.name}");
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select([\"y\"]){it.name}");
      });

      it('should handle no argument & 2 post-processing closures', function() {
        var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select("{it.id}{it.name}");
        query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select(){it.id}{it.name}");
      });
    });

    describe('.orderMap()', function () {
      it("should handle ordering class argument", function() {
        var query = gRex.gremlin().g.V().both().groupCount().cap().orderMap(T.decr);
        query.gremlin.script.should.equal("g.V().both().groupCount().cap().orderMap(T.decr)");
      });
    });
  });

  describe('Filter-based steps', function() {
    describe('[i]', function () {
      it('should chain .index(i) as [i]', function() {
        var query = gRex.gremlin().g.V().index(0).property('name');
        query.gremlin.script.should.equal("g.V()[0].property('name')");
      });
    });

    describe('[i...i]', function () {
      it('should chain .range() as [i..j]', function() {
        var query = gRex.gremlin().g.V().range('0..<2').property('name');
        query.gremlin.script.should.equal("g.V()[0..<2].property('name')");
      });
    });

    describe('.and()', function () {
      it('should chain .and() with two conditions', function() {
        var gremlin = gRex.gremlin();
        var query = gremlin.g.V().and(gremlin._().both("knows"), gremlin._().both("created"));

        query.gremlin.script.should.equal("g.V().and(_().both('knows'),_().both('created'))");
      });
    });

    describe('.or()', function () {
      it('should chain .or() with two conditions', function() {
        var gremlin = gRex.gremlin();
        var query = gremlin.g.v(1).outE().or(gremlin._().has('id', T.eq, 9), gremlin._().has('weight', T.lt, '0.6f'));

        query.gremlin.script.should.equal("g.v(1).outE().or(_().has('id',T.eq,9),_().has('weight',T.lt,0.6f))");
      });
    });

    describe('.retain()', function () {
      it('should handle an array of pipelines', function() {
        var gremlin = gRex.gremlin();
        var query = gremlin.g.V().retain([gremlin.g.v(1), gremlin.g.v(2), gremlin.g.v(3)]);

        query.gremlin.script.should.equal("g.V().retain([g.v(1),g.v(2),g.v(3),])");
      });
    });

    describe('.except()', function () {
      it('should chain .except()', function() {
        var query = gRex.gremlin().g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x');

        query.gremlin.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')");
      });
    });
  });

  describe('SideEffect-based steps', function() {
    describe('.gather()', function () {
      it("should handle a closure", function() {
        var query = gRex.gremlin().g.v(1).out().gather("{it.size()}");
        query.gremlin.script.should.equal("g.v(1).out().gather(){it.size()}");
      });
    });
  });

  describe('Branch-based steps', function() {
    describe('.copySplit()', function () {
      it("should chain .copySplit()", function() {
        var gremlin = gRex.gremlin();
        var query = gremlin.g.v(1).out('knows').copySplit(gremlin._().out('created').property('name'), gremlin._().property('age')).fairMerge();
        query.gremlin.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').property('name'),_().property('age')).fairMerge()");
      });
    });

    describe('.ifThenElse()', function () {
      it("should chain .ifThenElse()", function() {
        var query = gRex.gremlin().g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
        query.gremlin.script.should.equal("g.v(1).out().ifThenElse(){it.name=='josh'}{it.age}{it.name}");
      });
    });
  });
});


describe('Graph methods', function() {
  describe('indexing', function() {
    it("should support g.createIndex()", function() {
      var query = gRex.gremlin().g.createIndex("my-index", 'Vertex.class');
      query.gremlin.script.should.equal("g.createIndex('my-index',Vertex.class)");
    });

    it("should support g.idx().put()", function() {
      var gremlin = gRex.gremlin();
      var query = gRex.gremlin().g.idx("my-index").put("name", "marko", gremlin.g.v(1));
      query.gremlin.script.should.equal("g.idx('my-index').put('name','marko',g.v(1))");
    });

    it("should support g.idx(name, {})", function() {
      var query = gRex.gremlin().g.idx("my-index", {'name':'marko'});
      query.gremlin.script.should.equal("g.idx('my-index')[[name:'marko']]");
    });

    it("should support g.dropIndex()", function() {
      var query = gRex.gremlin().g.dropIndex("my-index");
      query.gremlin.script.should.equal("g.dropIndex('my-index')");
    });
  });

  describe('Elements', function() {
    it("should chain .keys()", function() {
      var query = gRex.gremlin().g.v(1).keys();
      query.gremlin.script.should.equal("g.v(1).keys()");
    });

    it("should chain .values()", function() {
      var query = gRex.gremlin().g.v(1).values();
      query.gremlin.script.should.equal("g.v(1).values()");
    });
  });
});

describe('Misc', function() {
  describe('float', function() {
    it("should handle float values", function() {
      var query = gRex.gremlin().g.v(1).outE().has("weight", T.gte, "0.5f");
      query.gremlin.script.should.equal("g.v(1).outE().has('weight',T.gte,0.5f)");
    });
  });
});
