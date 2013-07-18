var y = "bob";
var trxn = g.begin();
var vertex = trxn.addVertex({name:y});

trxn.commit().then
    (function(result) {
        console.log("Added a vertex successfully for", y);
        g.createIndex('actor', 'Vertex.class').then
            (function(result){
                g.idx('actor').put('name', y, g.v(vertex._id)).then
                    (function(result){
                    console.log("Index added successfully for", y);
                    }, function(err) {
                        console.log(err)
                    });
            }, function(err) {
                console.log(err)
            });
    }, function(err) {
        console.log(err)
    });