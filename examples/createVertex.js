var grex = require('../src/grex.js');
var t1, t2;
var trxn;

grex.connect({
                'host': 'localhost',
                'port': 8182,
                'graph': 'orientdbsample',
                'idRegex': /^[0-9]+:[0-9]+$/
            }).then(function(g){

	trxn = g.begin({name:'string',age:'integer', weight:'float'});

	t1 = trxn.addVertex({name:'Test1a', age:20});
	t2 = trxn.addVertex({name:'Test2a', age:'30'});
	trxn.addEdge(t1, t2, 'linked', {name:"ALabel", weight:1.2})

	// t1 = trxn.addVertex({name:'Test1b'});
	// t2 = trxn.addVertex({name:'Test2b'});
	// trxn.addEdge(t2, t1, 'linked', {name:"BLabel"})

	trxn.commit().then(function(result){
	    console.log("Added new vertices successfully. -> ", result);            
	}, function(err) {
	    console.error(err)
	});

});