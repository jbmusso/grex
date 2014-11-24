Grex
====

A JavaScript [TinkerPop Rexster 2.x+](https://github.com/tinkerpop/rexster/wiki) client for Node.js and the browsern.

gRex helps you send [Gremlin](https://github.com/tinkerpop/gremlin/wiki) queries to Rexster via HTTP. It supports [script engine bindings](https://github.com/tinkerpop/rexster/wiki/Gremlin-Extension#script-engine-bindings), [server-side scripts](https://github.com/tinkerpop/rexster/wiki/Gremlin-Extension#load-parameter) and [type system](https://github.com/tinkerpop/rexster/wiki/Property-Data-Types).

If you need help understanding the Gremlin API, you'll find [GremlinDocs](http://gremlindocs.com/), [SQL2Gremlin](http://sql2gremlin.com) and upcoming [TinkerPop3 documentation](http://www.tinkerpop.com/docs/current/) to be useful resources. The official [Gremlin users mailing list](https://groups.google.com/forum/#!forum/gremlin-users) is also a very valuable source of information.

Feel free to [open issues](https://github.com/gulthor/grex/issues) if you have trouble using the library (bugs, feature requests). Questions should be posted on [StackOverflow](http://stackoverflow.com/) with the `javascript` and `gremlin` tags.

## Contributing

The [master branch](https://github.com/gulthor/grex/tree/master) is a stable, release-only branch. Please check out the [develop branch](https://github.com/gulthor/grex/tree/develop) for the latest changes. Pull requests are welcome and should be sent against [develop](https://github.com/gulthor/grex/tree/develop).
* In case of bug fixes, please provide your pull requests with two commits: the first one with tests that show the problem being fixed (so I can checkout to it and see what's wrong), and the last one with the actual fix.
* If you wish to send a pull request with a new feature, please open an issue first so we can discuss about it.

## Testing

gRex is being developed with rexster-server-2.5.0. We use a slightly modified rexster.xml file located in `conf/`. Please follow the following steps to setup your test environment:
```
cd /path/to/rexster-server-2.5.0
ln -s /path/to/grex/conf/rexster-2.5.0.xml config/rexster-2.5.0-grex.xml
ln -s /path/to/grex/scripts scripts
bin/rexster.sh -s -c conf/rexster-2.5.0-grex.xml
```
This will start Rexster 2.5.0 with gRex test scripts folder loaded (required by tests).

Then run tests:
```
cd /path/to/grex
npm install
gulp test
```

## Installation

gRex works in Node.js and the browser.

```
$ npm install grex --save
```

## Quick start

Grex does three things:
* creates an HTTP client
* helps you generate a Gremlin queries (Groovy flavored)
* sends the query with any bound parameters for execution, retrieving the results (if any).

```javascript
var grex = require('grex');
var client = grex.createClient();
// Init a couple shortcuts
var gremlin = grex.gremlin;
var g = grex.g;

// 1. Initialize a Gremlin object to work with
var query = gremlin(g.v(1)); // query.script === 'g.v(1)'

// 2. Send script for execution, and return a raw response object with a 'results' Array property.
client.execute(query, function(err, response) {
  // ...
})
```

Shorter version (with dynamic query creation):

```javascript
client.execute(g.v(1)).done(function(response) {
  // ...
});
```

## Documentation

A distinct `GremlinScript` object is created internally every time you call `grex.gremlin()`. Each `GremlinScript` instance is independant from the others and [will be executed in a transaction](https://github.com/tinkerpop/rexster/wiki/Extension-Points#extensions-and-transactions), providing the exposed graph database you're using supports them.

In order to get an API closer to Groovy-flavored Gremlin, it is recommended that you add the following shortcuts on top of your JavaScript files:

```javascript
var g = grex.g; // Graph getter
var _ = grex._; // Pipeline getter. Beware of not conflicts and make sure you don't override libraries such as Underscore.js or Lodash.js
```
Be aware though that bound parameters are not yet supported when using the object wrappers. You should use the `printf` style for better performance and security (this will be discussed later in the documentation).

### Building a Gremlin script

```javascript
var query = gremlin(g.V('name', 'marko').out());
// query.script === "g.V('name','marko').out"
```

#### Building a multiline Gremlin script

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

#### Building a multiline Gremlin script with JavaScript variables

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

#### Building a Gremlin script with string formatting and bound parameters

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
client.execute(query, function(err, result) {
  //...
});
```

#### Multiline scripts combining Grex helpers and direct string formatting

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

A Gremlin script will be sent to Rexster for execution when you call the `client.execute()` method.

The previous example can thus be executed the following way:

```javascript
client.execute(query, function(err, response) {
  if(err) {
    console.error(err);
  }
  console.log(response.results);
});
```

Executing a one line script is trivial:

```javascript
client.execute(gremlin(g.v(1)), function (e, response) { console.log(response) });
```

##### Lazy query creation for one line scripts

For single line scripts, gRex allows you to directly pass an instance of `ObjectWrapper` to `client.execute()` (and `client.fetch()`). These methods will internally create a 'GremlinScript' which will be executed right away.

```javascript
client.fetch(g.V(), function (e, vertices) { console.log(vertices) });
```

Which is a shorthand for:
```javascript
client.fetch(gremlin(g.V()), function (e, vertices) { console.log(vertices) });
```

#### Fetching

Grex establishes a slight difference between executing and fetching.

While `client.execute()` returns a raw Rexster response object, `client.fetch()` directly returns the `results` part of the response object, allowing you to directly manipulate objects in your scripts without having to call `response.results`.

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

When creating your client with `grex.createClient(options)`, it is also possible to define your own custom function in `options.fetched` in order to change the behavior of `client.fetch()`. This is useful if you wish to automatically instantiate returned graph Elements with custom classes of your own. The default handlers in gRex only returns the `results` part of the `response`, making `client.fetch()` a very close cousin of `client.execute()`.

#### Executing a stored, server-side script

Please refer to Rexster documentation for help on [setting up server-side scripts](https://github.com/tinkerpop/rexster/wiki/Gremlin-Extension#load-parameter).

```javascript
var client = grex.createClient({
  load: ['vertices'] // Load vertices.gremlin, server-side
});

// Assumes vertices.gremlin contains an allVertices function
client.execute(gremlin('allVertices()'), function(err, results) {
  should.not.exist(err);
  should.exist(results);
  done();
});
```

### Accessing the internal GremlinScript instance of a query

Calling `query()` returns the internal instance of `GremlinScript`:

```javascript
var query = gremlin(g.V('name', 'marko').out());

console.log(query().constructor.name); // GremlinScript
// query().script === "g.V('name','marko').out"
```

Calling `query()` is especially useful if you wish to gain direct access to the lower level/private methods of the `GremlinScript` class. Unless debugging or trying to gain direct access to the raw script string, you shouldn't need to do this.

This allows you to directly set the `GremlinScript.script` property with an arbitrary string of Gremlin/Groovy (for example, the content of a `.groovy` file). You can also set the `GremlinScript.params` map and manually attach custom bound parameters to your script.


## API differences between Gremlin Groovy and gRex JavaScript

Grex tries to implement Gremlin (Groovy flavored) syntax as closely as possible. However, there are some notable differences.

All JavaScript method calls require parentheses __()__, even if there are no arguments. Using JavaScript getters could mimic the API The generated Groovy code will also use parentheses (see [Method Notation vs. Property Notation](https://github.com/tinkerpop/gremlin/wiki/Gremlin-Groovy-Path-Optimizations#method-notation-vs-property-notation)).

Here are several examples which illustrate the differences between Gremlin Groovy and gRex JavaScript. Note that Groovy generated strings are displayed first in the following examples.

### Support for multiple arguments or *Object* argument

```groovy
// Groovy
g.V('name', 'marko').out
```

```javascript
// JavaScript
g.V('name', 'marko').out();
g.V({ name: 'marko' }).out();
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

Closures currently need to be passed in as a string argument to methods. Though not trivial to implement, this will likely change in the future ([see issue#22](https://github.com/gulthor/grex/issues/22)). It could also be supported with a different API or maybe using ES6 Proxies. Suggestions welcomed!

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

When starting with gRex and/or Gremlin, it is recommended that you use the proxied getters/wrappers.

#### grex.createClient()

Instantiate a Rexster client.

Options:
* `host` - default: localhost
* `port` - default: 8182
* `graph` - default: tinkergraph
* `load` - an Array of server-side scripts to load
* `showTypes` - whether results should be returned with types (default: false)
* `fetched` - a function to apply, modifying the behavior of `client.fetch`

#### grex.gremlin

A getter returning a function.

Doing `grex.gremlin` will instantiate a new `GremlinScript` instance and return a function responsible for appending bits of Gremlin-Groovy scripts to the instance.

A getter which returns a function responsible for creating a new `GremlinScript` instance.

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

#### grex.g

A getter returning a `new Graph()` wrapper instance.

Graph methods return convenient wrapper objects, which is either:
* a new `PipelineWrapper` instance which you get when calling `g.v()`, `g.V()`, `g.E()`, etc.)
* a new `VertexWrapper` via `g.addVertex()` or new `EdgeWrapper` instance via `g.addEdge()`. Note that both classes inherits from `ElementWrapper`. They all inherits from `ObjectWrapper`.

#### grex._

A getter returning a `new Pipeline()` wrapper instance.


### Client

#### client.execute(gremlinScript, callback)

Sends the generated `GremlinScript` to the server for execution.

The callback takes an `err` object and a raw Rexster `response` object as arguments.

#### client.fetch(gremlinScript, callback)

Sends the generated `GremlinScript` to the server for execution.

The callback takes an `err` object, a `results` object (as a shortcut for `response.results`) and a `response` object.


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

## License

MIT (c) 2013-2014 Jean-Baptiste Musso, Entrendipity Pty Ltd.
