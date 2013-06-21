var g = require('grex');
var y = "bob";
g.addVertex(0, {name:y});
g.commit()
.then(function(result){
    if (result) {
        if (result.success == false) {
            console.log("Failed to add vertex for", y);
        } else {
            console.log("Added a vertex successfully for", y);
            g.createIndex("actor", "Vertex.class").get()
            .then(function(result){
                if (result) {
                    if (result.success == false) {
                        console.log("Failed to create index  - actor");
                    } else {
                        g.idx('actor').put('name', y, g.v(0)).get()
                        .then(function(result){
                            if (result) {
                                if (result.success == false) {
                                    console.log("Failed to add an index for", y);
                                } else {
                                    console.log("Index added successfully for", y);
                                }
                            }
                        }, function(err) {
                            console.log(err)
                        });
                    }
                }
            });
        }
    }
}, function(err) {
    console.log(err)
});