var gRex = require('../index.js'),
    T = gRex.T,
    Contains = gRex.Contains,
    Vertex = gRex.Vertex,
    Edge = gRex.Edge;

before(function(done){
    gRex.connect()
        .then(function(result) {
            g = result;
            done();
        })
        .fail(function(error) {
            console.error(error);
        });
});

describe('Transforms', function(){
    describe('id', function() {
        it("should return all ids", function(done){
            g.V().id()
                .then(function(result){
                    result.results.should.have.lengthOf(6);
                    result.results.should.eql([ '3', '2', '1', '6', '5', '4' ]);
                    done();
                })
                .fail(function(error) {
                    console.error(error);
                });
        });
    });

    describe('g.V', function(){
        it('should return 6 vertices', function(done){
            g.V()
                .then(function(result){
                    result.results.should.have.lengthOf(6);
                    done();
                });
        });

        it('should return marko vertex', function(done){
            g.V('name', 'marko')
                .then(function(result){
                    result.results.should.have.lengthOf(1);
                    result.results.should.includeEql({ name: 'marko', age: 29, _id: '1', _type: 'vertex' });
                    done();
                });
        });

    });

    describe('g.E', function(){
        it('should return 6 edges', function(done){
            g.E()
                .then(function(result){
                    result.results.should.have.lengthOf(6);
                    done();
                });
        });

        it('should return id and age array = [ [ "4", 32 ], [ "1", 29 ] ] ', function(done){
            g.E().has('weight', T.gt, '0.5f').outV().transform('{[it.id,it.age]}')
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.eql([ [ "4", 32 ], [ "1", 29 ] ]);
                    done();
                });
        });
    });

    describe('v', function() {
        it("should get id 1", function(done){
            g.v(1)
                .then(function(result){
                    result.results.should.have.lengthOf(1);
                    result.results.should.includeEql({ name: 'marko', age: 29, _id: '1', _type: 'vertex' });
                    done();
                });
        });

        it("should return id 1 & 4", function(done){
            g.v(1, 4)
                .then(function(result){
                    result.results.should.have.lengthOf(2);
                    result.results.should.includeEql({ name: 'marko', age: 29, _id: '1', _type: 'vertex' });
                    result.results.should.includeEql({ name: 'josh', age: 32, _id: '4', _type: 'vertex' });
                    done();
                });
        });

    });

    describe('select', function(){
        it('should return vertices with keys x & y', function(done){
            g.v(1).as('x').out('knows').as('y').select()
                .then(function(result){
                    result.results.should.have.lengthOf(2);
                    result.results[0].should.have.keys('x', 'y');
                    result.results[1].should.have.keys('x', 'y');
                    done();
                });
        });

        it('should return vertices with key y', function(done){
            g.v(1).as('x').out('knows').as('y').select(["y"])
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results[0].should.have.keys('y');
                    result.results[1].should.have.keys('y');
                    done();
                });
        });

        it('should return object with key y and name', function(done){
            g.v(1).as('x').out('knows').as('y').select(["y"],"{it.name}")
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.includeEql({ y: 'vadas' });
                    result.results.should.includeEql({ y: 'josh' });
                    done();
                });
        });

        it('should return vertices with id and name', function(done){
            g.v(1).as('x').out('knows').as('y').select("{it.id}{it.name}")
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results[0].should.have.keys('x', 'y');
                    result.results[1].should.have.keys('x', 'y');
                    done();
                });
        });
    });

    describe('orderMap', function() {
        it("should get id 1", function(done){
            g.V().both().groupCount().cap().orderMap(T.decr)
                .then(function(result){
                    //console.log(result);
                result.results.should.have.lengthOf(6);
                result.results.should.eql([
                    { name: 'lop', lang: 'java', _id: '3', _type: 'vertex' },
                    { name: 'marko', age: 29, _id: '1', _type: 'vertex' },
                    { name: 'josh', age: 32, _id: '4', _type: 'vertex' },
                    { name: 'vadas', age: 27, _id: '2', _type: 'vertex' },
                    { name: 'peter', age: 35, _id: '6', _type: 'vertex' },
                    { name: 'ripple', lang: 'java', _id: '5', _type: 'vertex'}
                ]);
                done();
            });
        });
    });
});

describe('Filters', function(){
    describe('g.V', function(){
        it('should return name = lop', function(done){
            g.V().index(0).property('name')
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(1);
                    result.results.should.eql(['lop']);
                    done();
                });
        });

        it('should return name = lop && vadas', function(done){
            g.V().range('0..<2').property('name')
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.eql(['lop', 'vadas']);
                    done();
                });
        });
    });

    describe('and', function(){
        it('should return marko & josh', function(done){
            g.V().and(g._().both("knows"), g._().both("created"))
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.includeEql({ name: 'marko', age: 29, _id: '1', _type: 'vertex' });
                    result.results.should.includeEql({ name: 'josh', age: 32, _id: '4', _type: 'vertex' });
                    done();
                });
        });
    });

    describe('or', function(){
        it('should return edges id 7 & 9', function(done){
            g.v(1).outE().or(g._().has('id', T.eq, 9), g._().has('weight', T.lt, '0.6f'))
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.includeEql({weight: 0.5, _id: '7', _type: 'edge', _outV: '1', _inV: '2', _label: 'knows'});
                    result.results.should.includeEql({ weight: 0.4, _id: '9', _type: 'edge', _outV: '1', _inV: '3', _label: 'created' });
                    done();
                });
        });
    });

    describe('retain', function(){
        it('should return vertices with id 3,2,1', function(done){
            g.V().retain([g.v(1), g.v(2), g.v(3)])
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(3);
                    result.results.should.includeEql({ name: 'marko', age: 29, _id: '1', _type: 'vertex' });
                    result.results.should.includeEql({ name: 'vadas', age: 27, _id: '2', _type: 'vertex' });
                    result.results.should.includeEql({ name: 'lop', lang: 'java', _id: '3', _type: 'vertex' });
                    done();
                });
        });
    });

    describe('except', function(){
        it('should return vertices josh & peter', function(done){
            g.V().has('age',T.lt,30).as('x').out('created').in('created').except('x')
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.includeEql({ name: 'josh', age: 32, _id: '4', _type: 'vertex' });
                    result.results.should.includeEql({ name: 'peter', age: 35, _id: '6', _type: 'vertex' });
                    done();
                });
        });
    });
});

describe('Side Effects', function(){
    describe('gather', function() {
        it("should get 3", function(done){
            g.v(1).out().gather("{it.size()}")
                .then(function(result){
                    result.results.should.have.lengthOf(1);
                    result.results[0].should.eql(3);
                    done();
                });
        });
    });
});

describe('Branch', function(){
    describe('copySplit', function() {
        it("should get [ 'ripple', 27, 'lop', 32 ]", function(done){
            g.v(1).out('knows').copySplit(g._().out('created').property('name'), g._().property('age')).fairMerge()
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(4);
                    result.results.should.eql([ 'ripple', 27, 'lop', 32 ]);
                    done();
                });
        });
    });

    describe('ifThenElse', function() {
        it("should get [ 'vadas', 32, 'lop' ]", function(done){
            g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}")
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(3);
                    result.results.should.eql([ 'vadas', 32, 'lop' ]);
                    done();
                });
        });
    });
});


describe('Methods', function(){
    describe('indexing', function() {
        it("should create index 'my-index'", function(done){
            g.createIndex("my-index", 'Vertex.class')
                .then(function(result){
                    result.results[0].should.eql('index[my-index:Vertex]');
                    done();
                });
        });

        it("should add name => marko to index 'my-index'", function(done){
            g.idx("my-index").put("name", "marko", g.v(1))
                .then(function(result){
                    // console.log(result);
                    result.success.should.eql(true);
                    done();
                });
        });
        it("should retrieve indexed value marko from 'my-index'", function(done){
            g.idx("my-index", {'name':'marko'})
                .then(function(result){
                    result.results.should.have.lengthOf(1);
                    result.results.should.includeEql({ name: 'marko', age: 29, _id: '1', _type: 'vertex' });
                    done();
                });
        });
        it("should drop index 'my-index'", function(done){
            g.dropIndex("my-index")
                .then(function(result){
                    // console.log(result);
                    result.success.should.eql(true);
                    done();
                });
        });
    });

    describe('keys', function() {
        it("should return name & age keys", function(done){
            g.v(1).keys()
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.eql([ 'age', 'name' ]);
                    done();
                });
        });
    });

    describe('values', function() {
        it("should return marko & 29 values", function(done){
            g.v(1).values()
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.eql([ 29, 'marko' ]);
                    done();
                });
        });
    });
});

describe('Misc', function(){
    describe('float', function() {
        it("should return weight", function(done){
            g.v(1).outE().has("weight", T.gte, "0.5f").property("weight")
                .then(function(result){
                    //console.log(result);
                    result.results.should.have.lengthOf(2);
                    result.results.should.eql([ 0.5, 1 ]);
                    done();
                });
        });
    });
});

