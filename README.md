Grex
====

[Gremlin](https://github.com/tinkerpop/gremlin/wiki) inspired [Rexster Graph Server](https://github.com/tinkerpop/rexster/wiki) client for Node.js, compatible with Tinkerpop 2.5.

Grex is a Gremlin (Groovy-flavored) generating library written in JavaScript which helps you build, send over HTTP and execute arbitrary strings of Gremlin against any Blueprint compliant Graph database.

If you're interested in an Object-to-Graph mapper library, you may also want to have a look at [Mogwai.js](https://github.com/gulthor/mogwai) built on top of Grex.

If you need help understanding the Gremlin API, you'll find [GremlinDocs](http://gremlindocs.com/), [SQL2Gremlin](http://sql2gremlin.com) and upcoming [Tinkerpop 3 documentation](http://www.tinkerpop.com/docs/tinkerpop3/3.0.0-SNAPSHOT/) to be useful resources.

## Support

Feel free to [open issues](https://github.com/gulthor/grex/issues) if you have trouble using the library. I'll happily provide support. You can also reach me quite often as Gulthor on IRC Freenode on #mogwai or #tinkerpop channels.

## Contributing

The [master branch](https://github.com/gulthor/grex/tree/master) is a stable, release-only branch. Check out the [develop branch](https://github.com/gulthor/grex/tree/develop) for the latest changes. Pull requests are welcome and should be sent against [develop](https://github.com/gulthor/grex/tree/develop) as well.

## Installation

Grex works in Node.js.

```
$ npm install grex
```

It currently doesn't work in the browser anymore, though it shouldn't be too hard to fix. Pull request welcome!

## Quick start

Grex does three things:
* establish a connection to Rexster
* generate a Gremlin-Groovy flavored string
* send the string with any bound parameters for execution, retrieving the results (if any).

```javascript
var grex = require('grex');
var client = grex.createClient();
// Init a couple shortcuts
var gremlin = grex.gremlin;
var g = grex.g;

// 1. Connect to default tinkergraph on localhost:8182
client.connect(function(err, client) {
  if (err) { console.error(err); }

  // 2. Initialize a Gremlin object to work with
  var query = gremlin(g.v(1)); // query.script === 'g.v(1)'

  // 3. Send script for execution, and return a raw response object with a 'results' Array property.
  client.exec(query, function(err, response) {
    // ...
  })
});
```

Shorter version of (2) and (3), with dynamic query creation:

```javascript
client.exec(g.v(1)).done(function(response) {
  // ...
});
```

## Documentation

A distinct `GremlinScript` object is created internally every time you call `grex.gremlin()`. Each `GremlinScript` instance is independant from the others and [will be executed in a transaction](https://github.com/tinkerpop/rexster/wiki/Extension-Points#extensions-and-transactions).

In order to get an API closer to Groovy-flavored Gremlin, it is recommended that you add the following shortcuts on top of your JavaScript files:

```javascript
var g = grex.g; // Graph getter
var _ = grex._; // Pipeline getter. Beware of conflicts and make sure you don't override libraries such as Underscore.js or Lodash.js
```

The main object you'll be working with is a `GremlinAppender` function which is responsible for appending strings to an internal instance of `GremlinScript` class. This function is returned by the `grex.gremlin` getter.

### Building a Gremlin script

```javascript
var query = gremlin(g.V('name', 'marko').out());
// query.script === "g.V('name','marko').out"
```

### Building a multiline Gremlin script

Creating a `GremlinScript` with multiple statements is done by calling `query()` multiple times:

```javascript
// JavaScript
var query = gremlin();
query(g.addVertex({ name: "Alice" }));
query(g.addVertex({ name: "Bob" }));
query(g.addVertex({ name: "Carol" }));
query(g.addVertex({ name: "Dave" }));
```

This will generate the following Groovy code, stored as a string in `query.script`:

```groovy
// Groovy
g.addVertex(["name": "Alice"])
g.addVertex(["name": "Bob"])
g.addVertex(["name": "Carol"])
g.addVertex(["name": "Dave"])
```
Note that spaces are actually ommitted in the generated string. This documentation will display them in the following examples for clarity.

### Building a multiline Gremlin script with JavaScript variables

The following is especially useful with transactions, for example when simultaneously creating vertices and edges.

Grex `query` function object returned by `grex.gremlin()` has a special `.var(statement[, identifier])` method which helps you identify a statement and store it in a variable.

```javascript
// JavaScript
var query = gremlin();
var bob = query.var(g.addVertex({ name: 'Bob' }));
var alice = query.var(g.addVertex({ name: 'Alice' }));
query(g.addEdge(bob, alice, 'likes', { since: 'now' }));
```

The above code will generate this Groovy script:
```groovy
// Groovy
i0 = g.addVertex(["name": "Bob"])
i1 = g.addVertex(["name": "Alice"])
g.addEdge(i0, i1, "likes", ["since":"now"])
```

The Rexster Gremlin extension will execute the provided script in a transaction (see [Rexster Wiki on extensions and transactions](https://github.com/tinkerpop/rexster/wiki/Extension-Points#extensions-and-transactions)).

This API is required because JavaScript unfortunately lacks reflection on variable names.

Although identifiers are automatically assigned within the context of a script, you can add a second optional parameters to `query.var()` and pass an arbitrary string to use as the identifier:

```javascript
// JavaScript
var query = gremlin();
var bob = query.var(g.addVertex({ name: 'Bob' }), 'v1');
```
Will generate:
```groovy
// Groovy
v1 = g.addVertex(["name": "Bob"])
```

### Building a Gremlin script with string formatting and bound parameters

Grex supports binding parameters when used with formatted strings. It internally uses [Node.js util.format](http://nodejs.org/api/util.html#util_util_format_format).

```javascript
var query = gremlin();
query('g.v(%s)', 1);
// query.script === "g.v(p0)"
// query.params === { p0: 1 }
```

This will generate the following Gremlin script, with a `gremlin.params = { p0: 1 }` params map attached and sent to Rexster:
```groovy
// Groovy
g.v(p0)
```

You can naturally pass multiple parameters:

```javascript
var query = gremlin();
query("g.addVertex('name', %s, 'age', %s)", "Bob", 26);
// query.script === "g.addVertex('name', p0, 'age', p1)"
// query.params.p0 === 'Bob'
// query.params.p1 === '26'
```

Note that it is currently not possible to change the bound parameter naming mechanism, which defaults to `p` followed by an automatically incremented integer.

**IMPORTANT:** gRex helpers/wrapper classes currently do NOT send your script parameters as bound parameters to Rexster. You are currently vulnerable to Gremlin-"SQL-like"-injection if you use the helpers. For increased security, please use the string format API described in this sub-section only.

For example, the following is currently unsafe if you don't trust your data source. Make sure you sanitize your input.

```javascript
// JavaScript
var query = gremlin(g.V('name', req.body.name));
client.exec(query, function(err, result) {
  //...
});
```

### Multiline scripts combining Grex helpers and direct string formatting

You can combine both style in multiline scripts:

```javascript
// JavaScript
var query = gremlin();
query('g.addVertex("name", %s)', 'Alice');
query(g.addVertex('name', 'Bob'))
// query.script === "g.addVertex('name', p0)\ng.addVertex('name','bob')\n"
// query.params.p0 === 'Alice'
```

### Executing a Gremlin script

#### Executing

A Gremlin script will be sent to Rexster for execution when you call the `client.exec()` method.

The previous example can thus be executed the following way:

```javascript
client.exec(query, function(err, response) {
  if(err) {
    console.error(err);
  }
  console.log(response.results);
});
```

Executing a one line script is trivial:

```javascript
client.exec(gremlin(g.v(1)), function (e, response) { console.log(response) });

```

Promise style:

```javascript
client.exec(gremlin(g.v(1))).done(function (response) { console.log(response) });
```

##### Lazy query creation for one line scripts

For single line scripts, gRex allows you to directly pass an instance of `ObjectWrapper` to `client.exec()` (and `client.fetch()`). These methods will internally create a 'GremlinScript' which will be executed right away.

```javascript
client.fetch(g.V(), function (e, vertices) { console.log(vertices) });
```

Which is a shorthand for:
```javascript
client.fetch(gremlin(g.V()), function (e, vertices) { console.log(vertices) });
```

#### Fetching

Grex establishes a slight difference between executing and fetching.

While `client.exec()` returns a raw Rexster response object, `client.fetch()` directly returns the `results` part of the response object, allowing you to directly manipulate objects in your scripts without having to call `response.results`.

```javascript
var query = g.V('type', 'user');
client.fetch(query, function(err, results) {
  if(err) {
    console.error(err);
  }
  console.log(results);
  var user = new UserModel(results[0]);
});
```

When creating your client with `grex.createClient(options)`, it is also possible to define your own custom function in `options.fetched` in order to change the behavior of `client.fetch()`. This is useful if you wish to automatically instantiate returned graph Elements with custom classes of your own. The default handlers in gRex only returns the `results` part of the `response`, making `client.fetch()` a very close cousin of `client.exec()`.

### Accessing the internal GremlinScript instance of a query

Calling `query()` returns the internal instance of `GremlinScript`:

```javascript
var query = gremlin(g.V('name', 'marko').out());

console.log(query().constructor.name); // GremlinScript
// query().script === "g.V('name','marko').out"
```

This is especially useful if you wish to gain direct access to the lower level/private methods of the `GremlinScript` class.

This allows you to directly set the `GremlinScript.script` property with an arbitrary string of Gremlin/Groovy (for example, the content of a `.groovy` file). You can also set the `GremlinScript.params` map and manually attach custom bound parameters to your script.


## API differences between Gremlin Groovy and Grex JavaScript

Grex tries to implement Gremlin (Groovy flavored) syntax as closely as possible. However, there are some notable differences.

All JavaScript method calls require parentheses __()__, even if there are no arguments. Using JavaScript getters could mimic the API The generated Groovy code will also use parentheses (see [Method Notation vs. Property Notation](https://github.com/tinkerpop/gremlin/wiki/Gremlin-Groovy-Path-Optimizations#method-notation-vs-property-notation)).

Here are several examples which illustrate the differences between Gremlin Groovy and Grex JavaScript. Note that Groovy generated strings are displayed first in the following examples.

### Support for multiple arguments or *Object* argument

```groovy
// Groovy
g.V('name', 'marko').out
```

```javascript
// JavaScript
g.V('name', 'marko').out();
g.V({name: 'marko'}).out();
```

### Support for multiple arguments or *Array* argument
```groovy
// Groovy
g.v(1, 4).out('knows', 'created').in
```

```javascript
// JavaScript
g.v(1, 4).out('knows', 'created').in();
g.v([1, 4]).out(['knows', 'created']).in();
```

### Array indexes

```groovy
// Groovy
g.V[0].name
```

```javascript
// JavaScript
g.V().index(0).property('name');
```

### Array ranges

```groovy
// Groovy
g.V[0..<2].name
```

```javascript
/// JavaScript
g.V().range('0..<2').property('name');
```

### Comparison tokens

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

### Passing of pipelines

Make sure you declare the following on top of your script:

```javascript
var _ = grex._;
// Beware of conflicts and make sure you don't override Underscore.js or Lodash.js
```
This allows you to call the `_()` function directly, leaving no differences with a Groovy environment:
```groovy
// Groovy
g.V.and(_().both("knows"), _().both("created"))
```

```javascript
// JavaScript
g.V().and(_().both("knows"), _().both("created"))
```

```groovy
// Groovy
g.v(1).outE.or(_().has('id', T.eq, "9"), _().has('weight', T.lt, 0.6f))
```

```javascript
// JavaScript
g.v(1).outE().or(_().has('id', 'T.eq', 9), _().has('weight', 'T.lt', '0.6f'));
```

```groovy
// Groovy
g.V.retain([g.v(1), g.v(2), g.v(3)])
```

```javascript
// JavaScript
g.V().retain([g.v(1), g.v(2), g.v(3)])
```

### Closures

Closures currently need to passed in as a string argument to methods. Though not trivial to implement, this will likely change in the future ([see issue#22](https://github.com/gulthor/grex/issues/22)). It could also be supported with a different API or maybe using ES6 Proxies. Suggestions welcomed!

```groovy
// Groovy
g.v(1).out.gather{it.size()}

g.v(1).out.ifThenElse{it.name=='josh'}{it.age}{it.name}

g.V.out.groupBy{it.name}{it.in}{it.unique().findAll{i -> i.age > 30}.name}.cap
```

```javascript
// JavaScript
g.v(1).out().gather("{it.size()}");

g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");

g.V().out().groupBy('{it.name}{it.in}{it.unique().findAll{i -> i.age > 30}.name}').cap()
```

### Java classes

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

Passing classes as strings might be deprecated in future versions.

### Retrieving indexed Elements

```groovy
// Groovy
g.idx("my-index")[[name:"marko"]]
```

```javascript
// JavaScript
g.idx("my-index", {name:"marko"});
```

This may change once ES6 Proxies are out.

### Other notable differences

* __Comparators__ and __Float__'s are not native javascript Types so they currently need to be passed in as a string to Grex methods. Floats need to be suffixed with a 'f'. This will probably change in future versions of Grex.

    ```javascript
    g.v(1).outE().has("weight", "T.gte", "0.5f").property("weight")
    ```
* Certain methods cannot (yet) be easily implemented. Such as `aggregate`, `store`, `table`, `tree` and `fill`. These methods require a local object to populate with data, which cannot be easily done in this environment. You may however directly pass an arbitrary string to `query()` to bypass this limitation.
* Tokens/Classes: You will notice that in the examples tokens are passed as string (i.e. 'T.gt'). However, Grex also exposes some objects for convenience that you can use in place of string representations in your queries. To access the objects, reference them like so:

  ```javascript
    var T = grex.T;
    var Contains = grex.Contains;
    var Vertex = grex.Vertex;
    var Edge = grex.Edge;
    // etc.
    // Most tokens/classes are exposed. Feel free to open an issue if some are missing.
  ```

## API documentation

### Grex

It is recommended, though not mandatory, that you use the proxied getters/wrappers.

#### grex.gremlin

A getter returning a function.

Doing `grex.gremlin` will instantiate a new `GremlinScript` instance and return a function responsible for appending bits of Gremlin-Groovy scripts to the instance.

A getter which returns a function responsible for creating a new GremlinScript instance.

```javascript
var grex = require('grex');
var g = grex.g;
var gremlin = grex.gremlin;

// Create two distinct GremlinScript instances
var queryA = gremlin();
var queryB = gremlin();

queryA(g.addVertex());
queryB(g.v(40));
queryA(g.v(1));

// queryA.script === 'g.addVertex()\ng.v(1)\n'
// queryB.script === 'g.v(40)\n'
```

Calling `var query = gremlin()` actually executes the function returned by the getter. `gremlin` is ''not'' a function per se; it just returns a function.


#### grex.g

A getter returning a `new Graph()` wrapper instance.

Graph methods return convenient wrapper objects, which is either:
* a new `PipelineWrapper` instance (ie. by calling `g.v()`, `g.V()`, `g.E()`, etc.)
* a new `VertexWrapper` via `g.addVertex()` or new `EdgeWrapper` instance via `g.addEdge()`. Note that both classes inherits from `ElementWrapper`. They all inherits from `ObjectWrapper`.


#### grex._

A getter returning a `new Pipeline()` wrapper instance.


### RexsterClient

Grex uses the [Q](http://documentup.com/kriskowal/q/) package to return a Promise when calling the asynchronous `connect()`, `exec()` and `fetch()` methods.

#### RexsterClient.connect(options, callback)

Option object is optional. Returns a promise.

Options specify the location of the database and name of the graph.

* `host` (default: localhost): Location of running Rexster server
* `port` (default: 8182): Rexster server port
* `graph` (default: tinkergraph): Graph name
* `fetched` (default: return `response.results`): An optional, custom function to override the default behavior of `client.fetch()`

```javascript
Grex.connect({
  host: 'localhost',
  graph: 'tinkergraph',
  port: 8182
});
```

This method has an asynchronous API although it does exclusively synchronous stuff. This will however make it compatible when Tinkerpop3 is released (support for Websocket).

#### RexsterClient.exec(gremlinScript, callback)

Sends the generated `GremlinScript` to the server for execution. This method either takes a callback, or returns a promise.

Callback signature: `err, response`

#### RexsterClient.fetch(gremlinScript, callback)

Sends the generated `GremlinScript` to the server for execution. This method either takes a callback, or returns a promise.

Callback signature: `err, results, response`

## Todo

* bound arguments on helpers/wrappers (for security and better performance on the server)
* closure as JavaScript functions
* simplified API (~~remove gremlin.g and gremlin._, remove Java .class~~, etc.)
* Rexpro?
* performance checks and improvements


## Author

Jean-Baptiste Musso - [@jbmusso](https://twitter.com/jbmusso).

Based on the work started by Frank Panetta - [@entrendipity](https://twitter.com/entrendipity).



## Contributors

https://github.com/gulthor/grex/graphs/contributors

##License

MIT (c) 2013-2014 Jean-Baptiste Musso, Entrendipity Pty Ltd.
