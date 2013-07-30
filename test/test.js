var gRex = require('../index.js');

//var g;
beforeEach(function(done){
	gRex.connect()
		.then(function(result){
      		g = result;
  			done();	
      	});
});

describe('Transforms', function(){
  	describe('id', function() {
        it("should return all ids", function(done){
            g.V().id().then(function(result){
            	//console.log(result);
	      			result.results.should.have.lengthOf(6);
	      			result.results.should.eql([ '3', '2', '1', '6', '5', '4' ]);
	      			done();	
	      		});
        });
    }),
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

	}),
    describe('g.E', function(){
	    it('should return 6 edges', function(done){
	    	g.E()
	      		.then(function(result){
	      			result.results.should.have.lengthOf(6);
	      			done();	
	      		});
    	});
    	
    	it('should return id and age array = [ [ "4", 32 ], [ "1", 29 ] ] ', function(done){
	    	g.E().has('weight', 'T.gt', '0.5f').outV().transform('{[it.id,it.age]}')
	      		.then(function(result){
	      			//console.log(result);
	      			result.results.should.have.lengthOf(2);
	      			result.results.should.eql([ [ "4", 32 ], [ "1", 29 ] ]);
	      			done();	
	      		});
    	});
  	}),
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

    })
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
	})

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
	})
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
    })
});

describe('Branch', function(){
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
    })
});


describe('Misc', function(){
	describe('float', function() {
        it("should return weight", function(done){
            g.v(1).outE().has("weight", "T.gte", "0.5f").property("weight")
            	.then(function(result){
            		//console.log(result);
            		result.results.should.have.lengthOf(2);
	      			result.results.should.eql([ 0.5, 1 ]);
	      			done();	
	      		});
        });
    })
});

