var grex = require('../src/grex.js');
var trxn;

var g = grex.connect()
	.then(function(g){
	
	console.log(g);
	trxn = g.begin();
	trxn.updateVertex(1, {age:'(l,50.2)'});
	trxn.commit().then(function(result){
	    console.log("updated vertice successfully. -> ", result);  

	}, function(err) {
	    console.error(err)
	});
}, function(err){
	console.log(err);
});