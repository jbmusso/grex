Grex
====

[Gremlin](https://github.com/tinkerpop/gremlin/wiki) inspired [Rexster Graph Server](https://github.com/tinkerpop/rexster/wiki) client for Node.js and the browser.

Grex is a Gremlin generating library written in JavaScript which helps you build, send over HTTP and execute arbitrary strings of Gremlin (Groovy flavored) against any Blueprint compliant Graph database.

If you're interested in an Object-to-Graph mapper library, you may also want to have a look at [Mogwai.js](https://github.com/gulthor/mogwai).

Feel free to [open issues](https://github.com/gulthor/grex/issues) if you have trouble using the library. I'll happily provide support.

## Installation

Grex works in Node.js.

```
$ npm install grex
```

It currently doesn't work in the browser anymore, though it shouldn't be too hard to fix. Pull request welcome!

## Quick start

Grex does three things:
* establish a connection to Rexster
* generate a Gremlin (Groovy flavored string)
* send the string for execution (retrieving the results if any).

```javascript
var grex = require('grex');

var settings = {
  'database': 'myGraphDB',
  'host': 'localhost',
  'port': 8182
};

// 1. connect() takes two optional parameters: a settings Object and a Node style callback
grex.connect(settings, function(err, client) {
  if (err) {
    console.error(err);
  }

  // 2. Initialize a Gremlin object to work with
  var gremlin = client.gremlin();

  // Start appending some code
  gremlin.g.v(1); // gremlin.script === 'g.v(1)'

  // 3. Send script for execution, and return a raw response object with a 'results' Array property.
  gremlin.exec(function(err, response) {
    // ...
  })
});
```

## Documentation

Two good resources to understand the Gremlin API are [GremlinDocs](http://gremlindocs.com/) and [SQL2Gremlin](http://sql2gremlin.com).

Grex uses the [Q](http://documentup.com/kriskowal/q/) module to return a Promise when calling the asynchronous `exec()` or `query()` methods.

### Basic usage

#### Building a Gremlin script

The main object you'll be working with is an instance of `GremlinScript` class.

```javascript
var gremlin = client.gremlin(); // Create a new GremlinScript instance.
gremlin.g.V('name', 'marko').out(); // Appends strings
// gremlin.script == "g.V('name','marko').out"
```

Alternatively and/or for one-liner scripts, you can create a new `GremlinScript` instance and directly pass a Gremlin statement to the `client.gremlin()` method:

```javascript
var g = client.g;
var gremlin = client.gremlin(g.V('name', 'marko').out());
// gremlin.script == "g.V('name','marko').out"
```

Grex exposes `Graph`, `Pipeline`, `Vertex` and `Edge` wrapper classes with multiple methods which help you automatically generate a valid Gremlin string.

Each Gremlin instance is basically appending strings to an internal `script` variable as you chain more methods to these wrapper classes. Grex provides many high level method you should use when building your script. Experts are free to hack around and directly use the lower level `gremlin.line()` or `gremlin.append()` methods to directly append an arbitrary string of Gremlin to the `gremlin.script` property.

#### Executing Gremlin script

A Gremlin script will be immediadly sent to Rexster for execution when you chain the `.exec()` command.

The previous example can thus be executed the following way:

```javascript
gremlin.exec(function(err, response) {
  if(err) {
    console.error(err);
  }
  console.log(response);
});
```

You can also chain `.exec()` directly in the Pipeline you're working with. This is especially useful if you wish to execute single line scripts:

```javascript
client.gremlin().g.V('name', 'marko').out().exec(function(err, response) {
  // ...
});
```

Note that because it shouldn't be the responsibility of a `Pipeline` instance to send a GremlinScript to Rexster for execution, the above example will most likely be deprecated before v1.0.0 in favor of the following syntax:

```javascript
client.gremlin(g.V('name', 'marko').out()).exec(function(err, response) {
  // ...
});
```

### Transactions

Because Grex sends one big string of Gremlin in a single HTTP request, the library supports full transaction. See [Rexster Wiki on extensions and transactions](https://github.com/tinkerpop/rexster/wiki/Extension-Points#extensions-and-transactions).

```javascript
var gremlin = client.gremlin();
var v1 = gremlin.g.addVertex({ k1:'v1', 'k2':'v2', k3:'v3', id: 100 }, 'vA');
var v2 = gremlin.g.addVertex({ k1:'v1', 'k2':'v2', k3:'v3', id: 200 }, 'vB');
gremlin.g.addEdge(v1, v2, 'pal', { weight: '0.75f' });

gremlin.exec(function(err, response) {
  // Handle error or response
})
```

The above code will generate and send the following Gremlin script for execution to Rexster:

```groovy
// Note that Grex actually does not generate the extra spaces shown here.
vA = g.addVertex(100, [k1: 'v1', k2: 'v2', k3: 'v3']);
vB = g.addVertex(200, [k1: 'v1', k2: 'v2', k3: 'v3']);
g.addEdge(vA, vB, 'pal', [weight: 0.75]);
```

Because JavaScript lacks reflection, you're required to supply an optional string identifier as the last parameter. This identifier will be used in the generated Gremlin string.

Please note that this API will most likely change before v1.0.


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

You may pass comparison tokens as strings or as appropriate JavaScript objects which grex directly exposes.

```groovy
// Groovy
g.E.has('weight', T.gt, 0.5f).outV.transform{[it.id,it.age]}
```

```javascript
// JavaScript
g.E().has('weight', 'T.gt', '0.5f').outV().transform('{[it.id,it.age]}');

// alternatively
var T = grex.T;
g.E().has('weight', T.gt, '0.5f').outV().transform('{[it.id,it.age]}');
```

#### Passing of pipelines

```groovy
// Groovy
g.V.and(_().both("knows"), _().both("created"))
```

```javascript
// JavaScript
g.V().and(gremlin._().both("knows"), gremlin._().both("created"))
```

```groovy
// Groovy
g.v(1).outE.or(_().has('id', T.eq, "9"), _().has('weight', T.lt, 0.6f))
```

```javascript
// JavaScript
g.v(1).outE().or(gremlin._().has('id', 'T.eq', 9), gremlin._().has('weight', 'T.lt', '0.6f'));
```

```groovy
// Groovy
g.V.retain([g.v(1), g.v(2), g.v(3)])
```

```javascript
// JavaScript
g.V().retain([g.v(1), g.v(2), g.v(3)])
```

#### Closures

Closures are currently passed in as strings.

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
g.createIndex("my-index", "Vertex.class");

// alternatively
var Vertex = grex.Vertex;
g.createIndex("my-index", Vertex);

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

* All method calls require parentheses __()__, even if there are no arguments. The generated Groovy code will also use parentheses, which is most likely faster to execute (see [Method Notation vs. Property Notation](https://github.com/tinkerpop/gremlin/wiki/Gremlin-Groovy-Path-Optimizations#method-notation-vs-property-notation)).
* Closures currently need to passed in as a string argument to methods. This will likely change in the future ([see issue#22](https://github.com/gulthor/grex/issues/22)). It could be supported with a different API or maybe using ES6 Proxies. Suggestions welcomed!

    ```javascript
    g.v(1).out().gather("{it.size()}");

    g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
    ```
* __Comparators__ and __Float__'s are not native javascript Types so they currently need to be passed in as a string to Grex methods. Floats need to be suffixed with a 'f'. This will probably change in future versions of Grex.

    ```
    g.v(1).outE().has("weight", "T.gte", "0.5f").property("weight")
    ```
* Certain methods cannot (yet) be easily implemented. Such as `aggregate`, `store`, `table`, `tree` and `fill`. These methods require a local object to populate with data, which cannot be easily done in this environment. You may however use `gremlin.append()` or `gremlin.line()` to bypass this limitation.
* Tokens/Classes: You will notice that in the examples tokens are passed as string (i.e. 'T.gt'). However, Grex also exposes some objects for convenience that you can use in place of string representations in your queries. To access the objects, reference them like so:

  ```javascript
    var T = grex.T;
    var Contains = grex.Contains;
    var Vertex = grex.Vertex;
    var Edge = grex.Edge;
    // etc.
    // Most tokens/classes are exposed. Feel free to open an issue if some are missing.
  ```

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

This method has an asynchronous API although it does exclusively synchronous stuff. This will however make it compatible when Tinkerpop3 is released (support for Websocket).

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


## Todo

* bound arguments (for better performance)
* closure as JavaScript functions
* simplified API (remove ~~gremlin.g~~ and gremlin._, remove ~~Java .class~~, etc.)
* Rexpro
* performance checks and improvements


## Author

Jean-Baptiste Musso - [@jbmusso](https://twitter.com/jbmusso).

Based on the work by Frank Panetta - [@entrendipity](https://twitter.com/entrendipity).



## Contributors

https://github.com/gulthor/grex/graphs/contributors

##License

MIT (c) 2013-2014 Entrendipity Pty Ltd, Jean-Baptiste Musso.