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
    it('should chain .V()', function() {
      var query = gRex.gremlin().g.V();
      query.gremlin.script.should.equal('g.V()');
    });

    it('should chain .V(key, value)', function() {
      var query = gRex.gremlin().g.V('name', 'marko');
      query.gremlin.script.should.equal("g.V('name','marko')");
    });

    it('should chain .E()', function() {
      var query = gRex.gremlin().g.E();
      query.gremlin.script.should.equal("g.E()");
    });

    it("should chain .v() with a numerical id", function() {
      var query = gRex.gremlin().g.v(1);
      query.gremlin.script.should.equal("g.v(1)");
    });

    it("should chain .v() with multiple numerical ids", function() {
      var query = gRex.gremlin().g.v(1, 4);
      query.gremlin.script.should.equal("g.v(1,4)");
    });

    it("should chain .id()", function() {
      var query = gRex.gremlin().g.V().id();
      query.gremlin.script.should.equal('g.V().id()');
    });

    it('should chain .transform() with a closure', function() {
      var query = gRex.gremlin().g.E().has('weight', T.gt, '0.5f').outV().transform('{[it.id,it.age]}');
      query.gremlin.script.should.equal("g.E().has('weight',T.gt,0.5f).outV().transform(){[it.id,it.age]}");
    });

    it('should chain .select()', function() {
      var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select();
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select()");
    });

    it('should chain .select([])', function() {
      var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select(["y"]);
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select([\"y\"])");
    });

    it('should chain .select([]) & 1 closure', function() {
      var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select(["y"],"{it.name}");
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select([\"y\"]){it.name}");
    });

    it('should chain .select() & 2 closures', function() {
      var query = gRex.gremlin().g.v(1).as('x').out('knows').as('y').select("{it.id}{it.name}");
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select(){it.id}{it.name}");
    });

    it("should chain .orderMap()", function() {
      var query = gRex.gremlin().g.V().both().groupCount().cap().orderMap(T.decr);
      query.gremlin.script.should.equal("g.V().both().groupCount().cap().orderMap(T.decr)");
    });
  });


  describe('Filter-based steps', function() {
    it('should chain .index() as []', function() {
      var query = gRex.gremlin().g.V().index(0).property('name');
      query.gremlin.script.should.equal("g.V()[0].property('name')");
    });

    it('should chain .range() as [..]', function() {
      var query = gRex.gremlin().g.V().range('0..<2').property('name');
      query.gremlin.script.should.equal("g.V()[0..<2].property('name')");
    });

    it('should chain .and() with 2 conditions', function() {
      var gremlin = gRex.gremlin();
      var query = gremlin.g.V().and(gremlin._().both("knows"), gremlin._().both("created"));
      query.gremlin.script.should.equal("g.V().and(_().both('knows'),_().both('created'))");
    });

    it('should chain .or() with 2 conditions', function() {
      var gremlin = gRex.gremlin();
      var query = gremlin.g.v(1).outE().or(gremlin._().has('id', T.eq, 9), gremlin._().has('weight', T.lt, '0.6f'));
      query.gremlin.script.should.equal("g.v(1).outE().or(_().has('id',T.eq,9),_().has('weight',T.lt,0.6f))");
    });

    it('should chain .retain([])', function() {
      var gremlin = gRex.gremlin();

      var query = gremlin.g.V().retain([gremlin.g.v(1), gremlin.g.v(2), gremlin.g.v(3)]);

      query.gremlin.script.should.equal("g.V().retain([g.v(1),g.v(2),g.v(3),])");
    });

    it('should chain .except()', function() {
      var query = gRex.gremlin().g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x');
      query.gremlin.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')");
    });
  });

  describe('SideEffect-based steps', function() {
    it("should chain .gather()", function() {
      var query = gRex.gremlin().g.v(1).out().gather("{it.size()}");
      query.gremlin.script.should.equal("g.v(1).out().gather(){it.size()}");
    });
  });

  describe('Branch-based steps', function() {
    it("should chain .ifThenElse()", function() {
      var query = gRex.gremlin().g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
      query.gremlin.script.should.equal("g.v(1).out().ifThenElse(){it.name=='josh'}{it.age}{it.name}");
    });

    it("should chain .copySplit()", function() {
      var gremlin = gRex.gremlin();
      var query = gremlin.g.v(1).out('knows').copySplit(gremlin._().out('created').property('name'), gremlin._().property('age')).fairMerge();
      query.gremlin.script.should.equal("g.v(1).out('knows').copySplit(_().out('created').property('name'),_().property('age')).fairMerge()");
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
