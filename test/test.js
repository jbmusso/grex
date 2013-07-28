var should = require('should');
var gRex = require('../index.js');

var g;
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
	      			result.results.should.have.lengthOf(6);
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
		})
	}),
    describe('g.E', function(){
	    it('should return 6 edges', function(done){
	    	g.E()
	      		.then(function(result){
	      			result.results.should.have.lengthOf(6);
	      			done();	
	      		});
    	})
  	})
});