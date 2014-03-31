var Grex = require('../index.js');

var settings = {
  'host': 'localhost',
  'port': 8182,
  'graph': 'tinkergraph',
  'idRegex': false
};

Grex.connect(settings, function(err, client) {
  var gremlin = client.gremlin();

  // The following will add 4 vertices and 2 edges in a transaction

  var v1 = gremlin.g.addVertex({ name: 'Foo', age: 20 }, 'v1');
  v1.addProperty('name2', 'testa');
  v1.setProperty('name2', 'updated');

  var v2 = gremlin.g.addVertex({ name:'Bar', age: 30 }, 'v2');
  gremlin.g.addEdge(v1, v2, 'knows', { met: "Somewhere", weight: 1.2 });

  var v3 = gremlin.g.addVertex({ name: 'Alice' }, 'v3');
  var v4 = gremlin.g.addVertex({ name: 'Bob' }, 'v4');
  gremlin.g.addEdge(v4, v3, 'likes', { key: "value" });

  gremlin.exec(function(err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log("Added new elements to the graph:", response);
    }
  });
});