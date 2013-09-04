var g = require('../src/grex.js');
var t1, t2;

var trxn = g.begin();

t1 = trxn.addVertex({name:'Test1a'});
t2 = trxn.addVertex({name:'Test2a'});
trxn.addEdge(t1, t2, 'linked', {name:"ALabel"})

t1 = trxn.addVertex({name:'Test1b'});
t2 = trxn.addVertex({name:'Test2b'});
trxn.addEdge(t2, t1, 'linked', {name:"BLabel"})

trxn.commit()
.then(function(result){
    console.log("Added new vertices successfully. -> ", result);            
}, function(err) {
    console.error(err)
});