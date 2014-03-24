Grex
====

[Gremlin](https://github.com/tinkerpop/gremlin/wiki) inspired [Rexster Graph Server](https://github.com/tinkerpop/rexster/wiki) client for NodeJS and the browser.

Grex is a Gremlin generating library written in JavaScript which helps you build, send over HTTP and execute arbitrary strings of Gremlin against any Blueprint compliant Graph database.

If you're interested in an Object-to-Graph mapper library, you may want to also have a look at [Mogwai.js](https://github.com/gulthor/mogwai).

## Installation

Grex works both in Node.js or in the browser.

```
$ npm install grex
```

You may also wish to use Grex in the browser, either as a RequireJS module or by inserting a `<script>` tag. Using Grex in the browser is essentially useful when prototyping applications and obviously should not be used in production with graph database containing sensitive informations.


## Quick start

Grex does 3 things : connect to a database, generate a Gremlin (Groovy flavored string) and send the string for execution (retrieving the results if any).

```javascript
var settings = {
  'database': 'myGraphDB',
  'host': 'localhost',
  'port': 8182
};

// 1. connect() takes two optional parameters: a settings Object and a Node style callback
Grex.connect(settings, function(err, client) {
  if (err) {
    console.error(err);
  }

  // 2. Initialize a Gremlin object to work with
  var gremlin = client.gremlin();

  // Start appending some code
  gremlin.g.v(1); // gremlin.script === 'g.v(1)'

  // 3. Send script for execution, and return a response with the results (if any)
  gremlin.exec(function(err, response) {
    // ...
  })
});
```

## Documentation

Two good resources to understand the Gremlin API are [GremlinDocs](http://gremlindocs.com/) and [SQL2Gremlin](http://sql2gremlin.com).

Grex uses the [Q](http://documentup.com/kriskowal/q/) module to return a Promise when calling the asynchronous `exec()` method.

### Basic usage

#### Building a Gremlin script

The main object you'll be working with is an instance of Gremlin class.

```javascript
var gremlin = Grex.gremlin() // Instantiate a new Gremlin script class.
gremlin.g.V('name', 'marko').out() // Appends strings
// gremlin.script == "g.V('name','marko').out"
```

Grex exposes `Graph`, `Pipeline`, `Vertex` and `Edge` wrapper classes with multiple methods which help you automatically generate a valid Gremlin string.

Each Gremlin instance is basically appending strings to an internal `script` variable as you issue more commands. Grex provides many high level method you should use when building your script (though experts are free to hack around and directly use the lower level Gremlin.line() or Gremlin.append() methods at their own risks).

#### Executing Gremlin script

A Gremlin script will be immediadly send to Rexster for execution when you issue the `.exec()` command.

The previous example can thus be executed the following way :

```javascript
// Node style callback
gremlin.exec(function(err, response) {
  if(err) {
    console.error(err);
  }
  console.log(response);
});
```

### Transactions

Multiple vertices and edges can be added in a transaction over one single http call.

```javascript
var gremlin = client.gremlin();
var v1 = g.addVertex.addVertex({k1:'v1', 'k2':'v2', k3:'v3', id: 100}, 'vA');
var v2 = g.addVertex.addVertex({k1:'v1', 'k2':'v2', k3:'v3', id: 200}, 'vB');
g.addVertex.addEdge(v1, v2, 'pal' , { weight: '0.75f' });

gremlin.exec(function(err, response) {
  // Handle error or response
})
```

This will generate and send the following Gremlin script for execution to Rexster:

```groovy
vA = g.addVertex(100, [k1: 'v1', k2: 'v2', k3: 'v3']);
vB = g.addVertex(200, [k1: 'v1', k2: 'v2', k3: 'v3']);
g.addEdge(vA, vB, 'pal', [weight: 0.75]);
// Note that Grex will actually automatically strip spaces away
```

Because JavaScript lacks reflection, you're required to supply an optional string identifier as the last parameter. This identifier will be used in the generated Gremlin string.



### API differences between Gremlin Groovy and Grex JavaScript

For simplicity the callbacks are not included in the examples below. Gremlin generated strings are displayed first in the following examples.

#### Support for multiple arguments or *Object* argument

```groovy
// Groovy
g.V('name', 'marko').out
```

```javascript
// JavaScript
g.V('name', 'marko').out();
g.V({name: 'marko'}).out();
```

#### Support for multiple arguments or *Array* argument
```groovy
// Groovy
g.v(1, 4).out('knows', 'created').in
```

```javascript
// JavaScript
g.v(1, 4).out('knows', 'created').in();
g.v([1, 4]).out(['knows', 'created']).in();
```

#### Array indexes

```groovy
// Groovy
g.V[0].name
```

```javascript
// JavaScript
g.V().index(0).property('name');
```

#### Array ranges

```groovy
// Groovy
g.V[0..<2].name
```

```javascript
/// JavaScript
g.V().range('0..<2').property('name');
```

#### Comparison tokens

Comparison tokens are currently passed in as strings.

```groovy
// Groovy
g.E.has('weight', T.gt, 0.5f).outV.transform{[it.id,it.age]}
```

```javascript
// JavaScript
g.E().has('weight', 'T.gt', '0.5f').outV().transform('{[it.id,it.age]}');
```

#### Passing of pipelines

```groovy
// Groovy
g.V.and(_().both("knows"), _().both("created"))
```

```javascript
// JavaScript
g.V().and(g._().both("knows"), g._().both("created"))
```

```groovy
// Groovy
g.v(1).outE.or(_().has('id', T.eq, "9"), _().has('weight', T.lt, 0.6f))
```

```javascript
// JavaScript
g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'));
```

```groovy
// Groovy
g.V.retain([g.v(1), g.v(2), g.v(3)])
```

```javascript
// JavaScript
g.V().retain([gremlin.g.v(1), gremlin.g.v(2), gremlin.g.v(3)])
```


#### Closures

Closures are currently passed in as strings. See https://github.com/gulthor/grex/issues/22 for a discussion on using JavaScript functions.

```groovy
// Groovy
g.V.out.groupBy{it.name}{it.in}{it.unique().findAll{i -> i.age > 30}.name}.cap
```

```javascript
// JavaScript
g.V().out().groupBy('{it.name}{it.in}{it.unique().findAll{i -> i.age > 30}.name}').cap()
```

#### Java classes

Java classes are currently passed in either as strings or as JavaScript objects.
```groovy
// Groovy
g.createIndex("my-index", Vertex.class)
```

```javascript
// JavaScript
g.createIndex("my-index", "Vertex.class")
```

#### Retrieving indexed Elements

```groovy
// Groovy
g.idx("my-index")[[name:"marko"]]
```

```javascript
// JavaScript
g.idx("my-index", {name:"marko"});
```

### Notable differences

Grex tries to implement Gremlin (Groovy flavored) syntax as closely as possible. However, there are some notable differences.

* All method calls require brackets __()__, even if there are no arguments.
* Closures currently need to passed in as a string argument to methods. This will likely change in the future ([see issue#22](https://github.com/gulthor/grex/issues/22)).

    ```javascript
    g.v(1).out().gather("{it.size()}");

    g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
    ```
* __Comparators__ and __Float__'s are not native javascript Types so they currently need to be passed in as a string to Grex methods. Floats need to be suffixed with a 'f'. This will probably change in future versions of Grex.

    ```
    g.v(1).outE().has("weight", "T.gte", "0.5f").property("weight")
    ```
* Certain methods cannot (yet) be easily implemented. Such as ``aggregate``, ``store``, ``table``, ``tree`` and ``fill``. These methods require a local object to populate with data, which cannot be easily done in this environment.
* Tokens/Classes: You will notice that in the examples tokens are passed as string (i.e. 'T.gt'). However, Grex also exposes some objects for convenience to make it feel more natural. To access the objects, reference them like so:

  ```javascript
    var T = Grex.T;
    var Contains = Grex.Contains;
    var Vertex = Grex.Vertex;
    var Edge = Grex.Edge;
  ```


You can now use these objects in place of the string representation in your queries.


## API

### Grex

#### Grex.connect(Object)

Options specify the location and name of the database.

* `host` (default: localhost): Location of Rexster server
* `port` (default: 8182): Rexster server port
* `graph` (default: tinkergraph): Graph database name
* `idRegex` (default: false): This can remain as false, if IDs are number. If IDs are not numbers (i.e. alpha-numeric or string), but still pass parseFloat() test, then idRegex must be set. This property will enable Grex to distinguish between an ID and a float expression.

```
Grex.connect({
  host: 'myDomain',
  graph: 'myOrientdb',
  idRegex: /^[0-9]+:[0-9]+$/
});
```

### Gremlin

#### Gremlin.g

A getter property. Returns a `new Graph()` wrapper instance. See https://github.com/gulthor/grex/blob/master/src/gremlin.js.

Graph methods return convenient wrapper objects, which is either:
* a new [`Pipeline`](https://github.com/gulthor/grex/blob/master/src/pipeline.js) instance (ie. by calling `g.v()`, `g.V()`, `g.E()`, etc.)
* a new [`Vertex`](https://github.com/gulthor/grex/blob/master/src/elements/vertex.js) via `g.addVertex()` or new [`Edge`](https://github.com/gulthor/grex/blob/master/src/elements/edge.js) instance via `g.addEdge()`. Both classes inherits from [`Element`](https://github.com/gulthor/grex/blob/master/src/elements/element.js).

See: https://github.com/gulthor/grex/blob/master/src/graph.js.

#### Gremlin.exec(callback)

Sends the generated `gremlin.script` to the server for execution. This method either takes a callback, or returns a promise.

#### Gremlin.append(String)

Appends an arbitrary string to the `gremlin.script`. This method is used internally but can be useful on some occasions. Use with caution.

#### Gremlin.line(String)

Appends an arbitrary string to the `gremlin.script` preceded by a `\n` character. This method is used internally but can be useful on some occasions. Use with caution.


## Author

Jean-Baptiste Musso - [@jbmusso](https://twitter.com/jbmusso).

Based on the work by Frank Panetta - [@entrendipity](https://twitter.com/entrendipity).



## Contributors

https://github.com/gulthor/grex/graphs/contributors

##License

MIT (c) 2013-2014 Entrendipity Pty Ltd, Jean-Baptiste Musso.