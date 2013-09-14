var grex = require('../src/grex.js');
var t1, t2;
var trxn;

grex.connect().then(function(g){

	trxn = g.begin();

	t1 = trxn.addVertex(111,{name:'Test1a'});
	t2 = trxn.addVertex(222,{name:'Test2a'});
	trxn.addEdge(111, 222, 'linked', {name:"ALabel"})

	// t1 = trxn.addVertex({name:'Test1b'});
	// t2 = trxn.addVertex({name:'Test2b'});
	// trxn.addEdge(t2, t1, 'linked', {name:"BLabel"})

	trxn.commit().then(function(result){
	    console.log("Added new vertices successfully. -> ", result);            
	}, function(err) {
	    console.error(err)
	});

});