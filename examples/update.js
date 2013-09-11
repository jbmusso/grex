var grex = require('../src/grex.js');
var trxn;


grex.connect()
	.then(function(g){
		
	    //g.V()
	    g.v(1)
	    	.then(function(r){
	    		console.log(JSON.stringify(r));
				
				//trxn = g.begin(/*{ name: 'string', age: 'integer', address:{'street':{number:'integer', name:'string'}}}*/);

				//trxn = g.begin(/*{ name: 'string', age: 'integer', address:{'street':{number:{unit:'integer',estate:'string'}}, primary:'boolean'}}*/);
				
				//trxn = g.begin({ friends: ['string','integer',{name:{first:'string', second:'string'}}]});

				trxn = g.begin({ friends: ['string','integer',{name:{first:'string',second:'string'}}]});

				//trxn.addVertex(100,{name:'Frank', age:'90'});
				//trxn.updateVertex(1, {age:'20'});
				
				//trxn.updateVertex(1, { address: {street:{number:{unit:15,estate:'test444Name'}}, primary: false}});

				trxn.updateVertex(1, { friends: ['Lisa', 5, {name:{first:'Craig',second:'p'}}]});

				//trxn.updateVertex(100, { friends: ['Lisa', 5, ['100.05',true]]});


				trxn.commit().then(function(result){
				    console.log("updated vertice successfully. -> ", result);  

				}, function(err) {
				    console.error(err)
				});
	    	});
	
	
	// //console.log(g);
	// trxn = g.begin(/*{age:'d'}*/);
	// trxn.updateVertex(1, {age:5});
	// trxn.commit().then(function(result){
	//     console.log("updated vertice successfully. -> ", result);  

	// }, function(err) {
	//     console.error(err)
	// });
}, function(err){
	console.log(err);
});