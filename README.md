Grex
====

[Gremlin](https://github.com/tinkerpop/gremlin/wiki) inspired javascript client for [Rexster Graph Server](https://github.com/tinkerpop/rexster/wiki).

## Dependancies

__batch kibble__ (Rexster extension)

Move the batch-kibble-XXX.jar, located in the modules ``lib`` folder, to the ``/ext`` folder under the rexster server directory.
Add an ``allow`` tag to the database extensions configuration in the rexster.xml file.

    <extensions>
        <allows>
            <allow>tp:gremlin</allow>
            <allow>tp:batch</allow>
        </allows>
    </extensions>

[__Q__](http://documentup.com/kriskowal/q/)

A tool for making and composing asynchronous promises in JavaScript.

## Installation

Grex can be loaded as:

-   a ``<script>`` tag in the browser (creating a ``g`` global variable)

    ```
     <script type="text/javascript" src="q.min.js"></script>    
     <script type="text/javascript" src="grex-client.js"></script>
    ```

-   a Node.js and CommonJS module available from NPM as the ``grex`` package

    ```bash
    $ npm install grex
    ```

    then in node

    ```
    var g = require(“grex”);
    ```

-   a RequireJS module

## Introduction

Grex tries to implement Gremlin syntax as closely as possible. However, there are some differences.

* All method calls require brackets __()__, even if there are no arguments.
* __Closures__ do not translate to javascript. Closures need to passed in as one string argument to grex methods. 

    ```e.g.
    g.v(1).out().gather("{it.size()}");

    g.v(1).out().ifThenElse("{it.name=='josh'}{it.age}{it.name}");
    ```
* __Comparators__ and __Float__'s are not native javascript Types so need to be passed in as a string to grex methods. Floats need to be suffixed with a 'f'.

    ```e.g.
    g.v(1).outE().has("weight", "T.gte", "0.5f").property("weight")
    ```
* Certain methods cannot be implemented. Such as ``aggregate``, ``store``, ``table``, ``tree`` and ``fill``. These methods take a local object and populate it with data, which cannot be done in this environment.

## Getting Started

###Options

Options specify the location and name of the database.

####host (default: localhost)

Location of Rexster server

####port (default: 8182)

Rexster server port

####graph (default: tinkergraph)

Graph database name

####idRegex (default: false)

This can remain as false, if IDs are number. If IDs are not numbers (i.e. alpha-numeric or string), but still pass parseFloat() test, then idRegex must be set. This property will enable grex to distinguish between an ID and a float expression.

```e.g.
g.setOptions({ host: 'myDomain', graph: 'myOrientdb', idRegex: /^[0-9]+:[0-9]+$/ });
```

## Examples

A good resource to understand the Gremlin API is [GremlinDocs](http://gremlindocs.com/). Below are examples of gremlin and it's equivalent grex syntax.

__N.B.:__ Grex uses the [Q](http://documentup.com/kriskowal/q/) module to return a Promise when making Ajax calls. All requests are invoked with ``get()`` and the callback is captured by ``then(result, error);``. However, this is not the case when performing Create, Update and Deletes of Vertices or Edges. These actions are batched to reduce the number of calls to the server. In order to send these type of requests invok ``g.commit().then(result, error);`` after making your updates to the data.

___All calls are invoked with get().___
```javascript
g.V('name', 'marko').out().get().then(function(result){console.log(result)}, function(err){console.log(err)});

g.createIndex('my-index', 'Vertex.class').get().then(function(result){console.log(result)}, function(err){console.log(err)});
```

___Except when creating, updating or deleting Vetices or Edges. Use g.commit() to commit all changes.___
```
grex>     g.addVertex(100, {k1:'v1', 'k2':'v2', k3:'v3'});

grex>     g.addVertex(200, {k1:'v1', 'k2':'v2', k3:'v3'});

grex>     g.addEdge(300,100,200,'pal',{weight:'0.75f'})

grex>     g.updateVertex(100, {k2: 'v4'});

grex>     g.removeVertex(100, ['k2', 'k3']);

grex>     g.removeVertex(200);

grex>     g.commit().then(function(result){console.log(result)}, function(err){console.log(err)});
```


For simplicity the callbacks are not included in the examples below.

__Example 1: Basic Transforms__

```
gremlin>  g.V('name', 'marko').out

grex>     g.V('name', 'marko').out();

grex>     g.V({name: 'marko'}).out();

gremlin>  g.v(1, 4).out('knows', 'created').in

grex>     g.v(1, 4).out('knows', 'created').in();

grex>     g.v([1, 4]).out(['knows', 'created']).in(); 

```

__Example 2: [i]__

```
gremlin>  g.V[0].name

grex>     g.V().index(0).property('name');
```

__Example 3: [i..j]__

```
gremlin>  g.V[0..<2].name

grex>     g.V().range('0..<2').property('name');
```

__Example 4: has__

```
gremlin>  g.E.has('weight', T.gt, 0.5f).outV.transform{[it.id,it.age]}

grex>     g.E().has('weight', 'T.gt', '0.5f').outV().transform('{[it.id,it.age]}');
```

__Example 5: and & or__


```
gremlin>  g.V.and(_().both("knows"), _().both("created"))

grex>     g.V().and(g._().both("knows"), g._().both("created"))

gremlin>  g.v(1).outE.or(_().has('id', T.eq, "9"), _().has('weight', T.lt, 0.6f))

grex>     g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f')); 
```

__Example 6: groupBy__

```
gremlin>    g.V.out.groupBy{it.name}{it.in}{it.unique().findAll{i -> i.age > 30}.name}.cap

grex>       g.V().out().groupBy('{it.name}{it.in}{it.unique().findAll{i -> i.age > 30}.name}').cap()
```

__Example 7: retain__

```
gremlin>  g.V.retain([g.v(1), g.v(2), g.v(3)])

grex>     g.V().retain([g.v(1), g.v(2), g.v(3)])
```

__Example 8: Create index__

```
gremlin>  g.createIndex("my-index", Vertex.class)

grex>     g.createIndex("my-index", "Vertex.class")
```

__Example 9: Add to index__

```
gremlin>  g.idx("my-index").put("name", "marko", g.v(1))

grex>     g.idx("my-index").put("name", "marko", g.v(1))
```

__Example 10: Retrieving indexed Element__

```
gremlin>  g.idx("my-index")[[name:"marko"]]  

grex>     g.idx("my-index", {name:"marko"});  
```

__Example 11: Drop index__

```
gremlin>  g.dropIndex("my-index", Vertex.class)

grex>     g.dropIndex("my-index", "Vertex.class")
```

__Example 12: Create, Update, Delete - use g.commit()__

```
grex>     g.addVertex(100, {k1:'v1', 'k2':'v2', k3:'v3'});

grex>     g.addVertex(200, {k1:'v1', 'k2':'v2', k3:'v3'});

grex>     g.addEdge(300,100,200,'pal',{weight:'0.75f'})

grex>     g.updateVertex(100, {k2: 'v4'});

grex>     g.removeVertex(100, ['k2', 'k3']);

grex>     g.removeVertex(200);

grex>     g.commit()
```

##TODO
* More around indexing
* Testing

## Author

Frank Panetta  - [Follow @entrendipity](https://twitter.com/intent/follow?screen_name=entrendipity)

##License
###The MIT License (MIT)

Copyright (c) 2013 entrendipity pty ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.