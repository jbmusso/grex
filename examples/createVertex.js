var g = require('../grex.js');
var t1, t2;

t1 = g.addVertex({name:'Test1a'});
t2 = g.addVertex({name:'Test2a'});
g.addEdge(t1, t2, 'linked', {name:"ALabel"})

t1 = g.addVertex({name:'Test1b'});
t2 = g.addVertex({name:'Test2b'});
g.addEdge(t2, t1, 'linked', {name:"BLabel"})

g.commit()
.then(function(result){
    if (result) {
        if (result.success == false) {
            console.error("Failed to add vertex.");
        } else {
            console.log("Added new vertex successfully. -> ", result);            
        }
    }
}, function(err) {
    console.error(err)
});