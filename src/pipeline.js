var Gremlin = require('./gremlin');

module.exports = (function () {
  function Pipeline(gRex) {
    this.gRex = gRex;
    this.gremlin = new Gremlin(this);
  }

  /**
   * Execute a query against the server.
   * Support the dual callback/promise API.
   *
   * WARNING: this method will likely be deprecated in the future.
   *
   * @param {Function} callback
   */
  Pipeline.prototype.get = function(callback) {
    return this.gRex.exec(this.gremlin.script).nodeify(callback);
  };

  /*** Transform ***/
  Pipeline.prototype._ = function() {
    return this.gremlin.queryMain('_').apply(this, arguments);
  };

  Pipeline.prototype.both = function() {
    return this.gremlin.queryMain('both').apply(this, arguments);
  };

  Pipeline.prototype.bothE = function() {
    return this.gremlin.queryMain('bothE').apply(this, arguments);
  };

  Pipeline.prototype.bothV = function() {
    return this.gremlin.queryMain('bothV').apply(this, arguments);
  };

  Pipeline.prototype.cap = function() {
    return this.gremlin.queryMain('cap').apply(this, arguments);
  };

  Pipeline.prototype.gather = function() {
    return this.gremlin.queryMain('gather').apply(this, arguments);
  };

  Pipeline.prototype.id = function() {
    return this.gremlin.queryMain('id').apply(this, arguments);
  };

  Pipeline.prototype.in = function() {
    return this.gremlin.queryMain('in').apply(this, arguments);
  };

  Pipeline.prototype.inE = function() {
    return this.gremlin.queryMain('inE').apply(this, arguments);
  };

  Pipeline.prototype.inV = function() {
    return this.gremlin.queryMain('inV').apply(this, arguments);
  };

  Pipeline.prototype.property = function() {
    return this.gremlin.queryMain('property').apply(this, arguments);
  };

  Pipeline.prototype.label = function() {
    return this.gremlin.queryMain('label').apply(this, arguments);
  };

  Pipeline.prototype.map = function() {
    return this.gremlin.queryMain('map').apply(this, arguments);
  };

  Pipeline.prototype.memoize = function() {
    return this.gremlin.queryMain('memoize').apply(this, arguments);
  };

  Pipeline.prototype.order = function() {
    return this.gremlin.queryMain('order').apply(this, arguments);
  };

  Pipeline.prototype.out = function() {
    return this.gremlin.queryMain('out').apply(this, arguments);
  };

  Pipeline.prototype.outE = function() {
    return this.gremlin.queryMain('outE').apply(this, arguments);
  };

  Pipeline.prototype.outV = function() {
    return this.gremlin.queryMain('outV').apply(this, arguments);
  };

  Pipeline.prototype.path = function() {
    return this.gremlin.queryMain('path').apply(this, arguments);
  };

  Pipeline.prototype.scatter = function() {
    return this.gremlin.queryMain('scatter').apply(this, arguments);
  };

  Pipeline.prototype.select = function() {
    return this.gremlin.queryMain('select').apply(this, arguments);
  };

  Pipeline.prototype.transform = function() {
    return this.gremlin.queryMain('transform').apply(this, arguments);
  };

  Pipeline.prototype.orderMap = function() {
    return this.gremlin.queryMain('orderMap').apply(this, arguments);
  };

  /*** Filter ***/
  // index(i)
  Pipeline.prototype.index = function() {
    return this.gremlin.queryIndex().apply(this, arguments);
  };

  // range('[i..j]')
  Pipeline.prototype.range = function() {
    return this.gremlin.queryIndex().apply(this, arguments);
  };

  Pipeline.prototype.and = function() {
    return this.gremlin.queryPipes('and').apply(this, arguments);
  };

  Pipeline.prototype.back = function() {
    return this.gremlin.queryMain('back').apply(this, arguments);
  };

  Pipeline.prototype.dedup = function() {
    return this.gremlin.queryMain('dedup').apply(this, arguments);
  };

  Pipeline.prototype.except = function() {
    return this.gremlin.queryCollection('except').apply(this, arguments);
  };

  Pipeline.prototype.filter = function() {
    return this.gremlin.queryMain('filter').apply(this, arguments);
  };

  Pipeline.prototype.has = function() {
    return this.gremlin.queryMain('has').apply(this, arguments);
  };

  Pipeline.prototype.hasNot = function() {
    return this.gremlin.queryMain('hasNot').apply(this, arguments);
  };

  Pipeline.prototype.interval = function() {
    return this.gremlin.queryMain('interval').apply(this, arguments);
  };

  Pipeline.prototype.or = function() {
    return this.gremlin.queryPipes('or').apply(this, arguments);
  };

  Pipeline.prototype.random = function() {
    return this.gremlin.queryMain('random').apply(this, arguments);
  };

  Pipeline.prototype.retain = function() {
    return this.gremlin.queryCollection('retain').apply(this, arguments);
  };

  Pipeline.prototype.simplePath = function() {
    return this.gremlin.queryMain('simplePath').apply(this, arguments);
  };

  /*** Side Effect ***/
  Pipeline.prototype.aggregate = function() {
    throw new Error('Not implemented.');
  };

  Pipeline.prototype.as = function() {
    return this.gremlin.queryMain('as').apply(this, arguments);
  };

  Pipeline.prototype.groupBy = function() {
    return this.gremlin.queryMain('groupBy').apply(this, arguments);
  };

  // Not FullyImplemented ??
  Pipeline.prototype.groupCount = function() {
    return this.gremlin.queryMain('groupCount').apply(this, arguments);
  };

  Pipeline.prototype.optional = function() {
    return this.gremlin.queryMain('optional').apply(this, arguments);
  };

  Pipeline.prototype.sideEffect = function() {
    return this.gremlin.queryMain('sideEffect').apply(this, arguments);
  };

  Pipeline.prototype.linkBoth = function() {
    return this.gremlin.queryMain('linkBoth').apply(this, arguments);
  };

  Pipeline.prototype.linkIn = function() {
    return this.gremlin.queryMain('linkIn').apply(this, arguments);
  };

  Pipeline.prototype.linkOut = function() {
    return this.gremlin.queryMain('linkOut').apply(this, arguments);
  };

  Pipeline.prototype.store = function() {
    throw new Error('Not implemented');
  };

  Pipeline.prototype.table = function() {
    throw new Error('Not implemented');
  };

  Pipeline.prototype.tree = function() {
    throw new Error('Not implemented');
  };

  /*** Branch ***/
  Pipeline.prototype.copySplit = function() {
    return this.gremlin.queryPipes('copySplit').apply(this, arguments);
  };
  Pipeline.prototype.exhaustMerge = function() {
    return this.gremlin.queryMain('exhaustMerge').apply(this, arguments);
  };

  Pipeline.prototype.fairMerge = function() {
    return this.gremlin.queryMain('fairMerge').apply(this, arguments);
  };

  // g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
  Pipeline.prototype.ifThenElse = function() {
    return this.gremlin.queryMain('ifThenElse').apply(this, arguments);
  };

  Pipeline.prototype.loop = function() {
    return this.gremlin.queryMain('loop').apply(this, arguments);
  };

  /*** Methods ***/
  Pipeline.prototype.fill = function() {
    throw new Error('Not implemented');
  };

  Pipeline.prototype.count = function() {
    return this.gremlin.queryMain('count').apply(this, arguments);
  };

  Pipeline.prototype.iterate = function() {
    return this.gremlin.queryMain('iterate').apply(this, arguments);
  };

  Pipeline.prototype.next = function() {
    return this.gremlin.queryMain('next').apply(this, arguments);
  };

  Pipeline.prototype.toList = function() {
    return this.gremlin.queryMain('toList').apply(this, arguments);
  };

  Pipeline.prototype.keys = function() {
    return this.gremlin.queryMain('keys').apply(this, arguments);
  };

  Pipeline.prototype.remove = function() {
    return this.gremlin.queryMain('remove').apply(this, arguments);
  };

  Pipeline.prototype.values = function() {
    return this.gremlin.queryMain('values').apply(this, arguments);
  };

  Pipeline.prototype.put = function() {
    return this.gremlin.queryPipes('put').apply(this, arguments);
  };

  Pipeline.prototype.getPropertyKeys = function() {
    return this.gremlin.queryMain('getPropertyKeys').apply(this, arguments);
  };

  Pipeline.prototype.setProperty = function() {
    return this.gremlin.queryMain('setProperty').apply(this, arguments);
  };

  Pipeline.prototype.getProperty = function() {
    return this.gremlin.queryMain('getProperty').apply(this, arguments);
  };

  // Titan specifics
  Pipeline.prototype.name = function() {
    return this.gremlin.queryMain('name').apply(this, arguments);
  };

  Pipeline.prototype.dataType = function() {
    return this.gremlin.queryMain('dataType').apply(this, arguments);
  };

  Pipeline.prototype.indexed = function() {
    return this.gremlin.queryMain('indexed').apply(this, arguments);
  };

  Pipeline.prototype.unique = function() {
    return this.gremlin.queryMain('unique').apply(this, arguments);
  };

  Pipeline.prototype.makePropertyKey = function() {
    return this.gremlin.queryMain('makePropertyKey').apply(this, arguments);
  };

  Pipeline.prototype.group = function() {
    return this.gremlin.queryMain('group').apply(this, arguments);
  };

  Pipeline.prototype.makeEdgeLabel = function() {
    return this.gremlin.queryMain('makeEdgeLabel').apply(this, arguments);
  };

  Pipeline.prototype.query = function() {
    return this.gremlin.queryMain('query').apply(this, arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.single = function() {
    return this.gremlin.queryMain('single').apply(this, arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.list = function() {
    return this.gremlin.queryMain('list').apply(this, arguments);
  };

  // Titan v0.4.0+: replaces unique(Direction.IN)
  Pipeline.prototype.oneToMany = function() {
    return this.gremlin.queryMain('oneToMany').apply(this, arguments);
  };

  // Titan v0.4.0+: replaces unique(Direction.OUT)
  Pipeline.prototype.manyToOne = function() {
    return this.gremlin.queryMain('manyToOne').apply(this, arguments);
  };

  // Titan v0.4.0+: replaces unique(Direction.IN) and unique(Direction.OUT)
  Pipeline.prototype.oneToOne = function() {
    return this.gremlin.queryMain('oneToOne').apply(this, arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeKey = function() {
    return this.gremlin.queryMain('makeKey').apply(this, arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeLabel = function() {
    return this.gremlin.queryMain('makeLabel').apply(this, arguments);
  };

  Pipeline.prototype.make = function() {
    return this.gremlin.queryMain('make').apply(this, arguments);
  };

  Pipeline.prototype.sortKey = function() {
    return this.gremlin.queryMain('sortKey').apply(this, arguments);
  };

  Pipeline.prototype.signature = function() {
    return this.gremlin.queryMain('signature').apply(this, arguments);
  };

  Pipeline.prototype.unidirected = function() {
    return this.gremlin.queryMain('unidirected').apply(this, arguments);
  };

  Pipeline.prototype.createKeyIndex = function() {
    return this.gremlin.queryMain('createKeyIndex').apply(this, arguments);
  };

  Pipeline.prototype.getIndexes = function() {
    return this.gremlin.queryMain('getIndexes').apply(this, arguments);
  };

  Pipeline.prototype.hasIndex = function() {
    return this.gremlin.queryMain('hasIndex').apply(this, arguments);
  };

  return Pipeline;

})();
