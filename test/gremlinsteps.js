var gRex = require('../index.js'),
  T = gRex.T,
  Contains = gRex.Contains,
  Vertex = gRex.Vertex,
  Edge = gRex.Edge;


before(function(done) {
  gRex.connect()
    .then(function(result) {
      g = result;
      done();
    })
    .fail(function(error) {
      console.error(error);
    });
});

describe('Gremlin steps', function() {
  describe('Transform-based steps', function() {
    it('should chain .V()', function() {
      var query = g.V();
      query.gremlin.script.should.equal('g.V()');
    });

    it('should chain .V(key, value)', function() {
      var query = g.V('name', 'marko');
      query.gremlin.script.should.equal("g.V('name','marko')");
    });

    it('should chain .E()', function() {
      var query = g.E();
      query.gremlin.script.should.equal("g.E()");
    });

    it("should chain .v() with a numerical id", function() {
      var query = g.v(1);
      query.gremlin.script.should.equal("g.v(1)");
    });

    it("should chain .v() with multiple numerical ids", function() {
      var query = g.v(1, 4);
      query.gremlin.script.should.equal("g.v(1,4)");
    });

    it("should chain .id()", function() {
      var query = g.V().id();
      query.gremlin.script.should.equal('g.V().id()');
    });

    it('should chain .transform() with a closure', function() {
      var query = g.E().has('weight', T.gt, '0.5f').outV().transform('{[it.id,it.age]}');
      query.gremlin.script.should.equal("g.E().has('weight',T.gt,0.5f).outV().transform(){[it.id,it.age]}");
    });

    it('should chain .select()', function() {
      var query = g.v(1).as('x').out('knows').as('y').select();
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select()");
    });

    it('should chain .select([])', function() {
      var query = g.v(1).as('x').out('knows').as('y').select(["y"]);
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select([\"y\"])");
    });

    it('should chain .select([]) & 1 closure', function() {
      var query = g.v(1).as('x').out('knows').as('y').select(["y"],"{it.name}");
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select([\"y\"]){it.name}");
    });

    it('should chain .select() & 2 closures', function() {
      var query = g.v(1).as('x').out('knows').as('y').select("{it.id}{it.name}");
      query.gremlin.script.should.equal("g.v(1).as('x').out('knows').as('y').select(){it.id}{it.name}");
    });

    it("should chain .orderMap()", function() {
      var query = g.V().both().groupCount().cap().orderMap(T.decr);
      query.gremlin.script.should.equal("g.V().both().groupCount().cap().orderMap(T.decr)");
    });
  });


  describe('Filter-based steps', function() {
    it('should chain .index() as []', function() {
      var query = g.V().index(0).property('name');
      query.gremlin.script.should.equal("g.V()[0].property('name')");
    });

    it('should chain .range() as [..]', function() {
      var query = g.V().range('0..<2').property('name');
      query.gremlin.script.should.equal("g.V()[0..<2].property('name')");
    });

    it('should chain .and() with 2 conditions', function() {
      var query = g.V().and(g._().both("knows"), g._().both("created"));
      query.gremlin.script.should.equal("g.V().and(g._().both('knows'),g._().both('created'))");
    });

    it('should chain .or() with 2 conditions', function() {
      var query = g.v(1).outE().or(g._().has('id', T.eq, 9), g._().has('weight', T.lt, '0.6f'));
      query.gremlin.script.should.equal("g.v(1).outE().or(g._().has('id',T.eq,9),g._().has('weight',T.lt,0.6f))");
    });

    it('should chain .retain([])', function() {
      var query = g.V().retain([g.v(1), g.v(2), g.v(3)]);
      query.gremlin.script.should.equal("g.V().retain([g.v(1),g.v(2),g.v(3),])");
    });

    it('should chain .except()', function() {
      var query = g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x');
      query.gremlin.script.should.equal("g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')");
    });
  });

  describe('SideEffect-based steps', function() {
    it("should chain .gather()", function() {
      var query = g.v(1).out().gather("{it.size()}");
      query.gremlin.script.should.equal("g.v(1).out().gather(){it.size()}");
    });
  });

  describe('Branch-based steps', function() {
    it("should chain .ifThenElse()", function() {
      var query = g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
      query.gremlin.script.should.equal("g.v(1).out().ifThenElse(){it.name=='josh'}{it.age}{it.name}");
    });

    it("should chain .copySplit()", function() {
      var query = g.v(1).out('knows').copySplit(g._().out('created').property('name'), g._().property('age')).fairMerge();
      query.gremlin.script.should.equal("g.v(1).out('knows').copySplit(g._().out('created').property('name'),g._().property('age')).fairMerge()");
    });
  });
});


describe('Graph methods', function() {
  describe('indexing', function() {
    it("should support g.createIndex()", function() {
      var query = g.createIndex("my-index", 'Vertex.class');
      query.gremlin.script.should.equal("g.createIndex('my-index',Vertex.class)");
    });

    it("should support g.idx().put()", function() {
      var query = g.idx("my-index").put("name", "marko", g.v(1));
      query.gremlin.script.should.equal("g.idx('my-index').put('name','marko',g.v(1))");
    });

    it("should support g.idx(name, {})", function() {
      var query = g.idx("my-index", {'name':'marko'});
      query.gremlin.script.should.equal("g.idx('my-index')[[name:'marko']]");
    });

    it("should support g.dropIndex()", function() {
      var query = g.dropIndex("my-index");
      query.gremlin.script.should.equal("g.dropIndex('my-index')");
    });
  });

  describe('Elements', function() {
    it("should chain .keys()", function() {
      var query = g.v(1).keys();
      query.gremlin.script.should.equal("g.v(1).keys()");
    });

    it("should chain .values()", function() {
      var query = g.v(1).values();
      query.gremlin.script.should.equal("g.v(1).values()");
    });
  });
});

describe('Misc', function() {
  describe('float', function() {
    it("should handle float values", function() {
      var query = g.v(1).outE().has("weight", T.gte, "0.5f");
      query.gremlin.script.should.equal("g.v(1).outE().has('weight',T.gte,0.5f)");
    });
  });
});
