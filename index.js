;(function(){
	var grex = require(__dirname + '/src/grex.js');
	//var compat = require(__dirname + '/src/node-compat.js');
	/*Override browser specific functions*/
	// orientdb.REST.then = compat.post();
	// orientdb.REST.authenticate = compat.auth();
	module.exports = grex;
})();