var grex = require('../src/grex.js');
var trxn;


var g = grex.connect()
	.then(function(g){
		
	    //g.V()
	    g.v(6,1,4)
	    	.then(function(){
	    		//console.log(g);
				
				//trxn = g.begin(/*{ name: 'string', age: 'integer', address:{'street':{number:'integer', name:'string'}}}*/);

				trxn = g.begin(/*{ name: 'string', age: 'integer', address:{'street':{number:{unit:'integer',estate:'string'}}, primary:'boolean'}}*/);

				//trxn.addVertex(100,{name:'Frank', age:'90'});
				//trxn.updateVertex(1, {age:'20'});
				
				//trxn.updateVertex(1, { address: {street:{number:5,name:'testName'}}});

				trxn.updateVertex(100, { address: {street:{number:{unit:12,estate:'Panetta12'}}, primary:true} });


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