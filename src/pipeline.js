var Gremlin = require('./gremlin');

module.exports = (function () {
  function Pipeline(gremlin) {
    this.gremlin = gremlin;
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
    return this.gremlin.exec(callback);
  };

  Pipeline.prototype.add = function(methodName, type, args) {
    this.gremlin['query' + type](methodName, args);

    return this;
  };

  Pipeline.prototype.both = function() {
    return this.add('both', 'Main', arguments);
  };

  Pipeline.prototype.bothE = function() {
    return this.add('bothE', 'Main', arguments);
  };

  Pipeline.prototype.bothV = function() {
    return this.add('bothV', 'Main', arguments);
  };

  Pipeline.prototype.cap = function() {
    return this.add('cap', 'Main', arguments);
  };

  Pipeline.prototype.gather = function() {
    return this.add('gather', 'Main', arguments);
  };

  Pipeline.prototype.id = function() {
    return this.add('id', 'Main', arguments);
  };

  Pipeline.prototype.in = function() {
    return this.add('in', 'Main', arguments);
  };

  Pipeline.prototype.inE = function() {
    return this.add('inE', 'Main', arguments);
  };

  Pipeline.prototype.inV = function() {
    return this.add('inV', 'Main', arguments);
  };

  Pipeline.prototype.property = function() {
    return this.add('property', 'Main', arguments);
  };

  Pipeline.prototype.label = function() {
    return this.add('label', 'Main', arguments);
  };

  Pipeline.prototype.map = function() {
    return this.add('map', 'Main', arguments);
  };

  Pipeline.prototype.memoize = function() {
    return this.add('memoize', 'Main', arguments);
  };

  Pipeline.prototype.order = function() {
    return this.add('order', 'Main', arguments);
  };

  Pipeline.prototype.out = function() {
    return this.add('out', 'Main', arguments);
  };

  Pipeline.prototype.outE = function() {
    return this.add('outE', 'Main', arguments);
  };

  Pipeline.prototype.outV = function() {
    return this.add('outV', 'Main', arguments);
  };

  Pipeline.prototype.path = function() {
    return this.add('path', 'Main', arguments);
  };

  Pipeline.prototype.scatter = function() {
    return this.add('scatter', 'Main', arguments);
  };

  Pipeline.prototype.select = function() {
    return this.add('select', 'Main', arguments);
  };

  Pipeline.prototype.transform = function() {
    return this.add('transform', 'Main', arguments);
  };

  Pipeline.prototype.orderMap = function() {
    return this.add('orderMap', 'Main', arguments);
  };

  /*** Filter ***/
  // index(i)
  Pipeline.prototype.index = function() {
    return this.add('', 'Index', arguments);
  };

  // range('[i..j]')
  Pipeline.prototype.range = function() {
    return this.add('', 'Index', arguments);
  };

  Pipeline.prototype.and = function() {
    return this.add('and', 'Pipes', arguments);
  };

  Pipeline.prototype.back = function() {
    return this.add('back', 'Main', arguments);
  };

  Pipeline.prototype.dedup = function() {
    return this.add('dedup', 'Main', arguments);
  };

  Pipeline.prototype.except = function() {
    return this.add('except', 'Collection', arguments);
  };

  Pipeline.prototype.filter = function() {
    return this.add('filter', 'Main', arguments);
  };

  Pipeline.prototype.has = function() {
    return this.add('has', 'Main', arguments);
  };

  Pipeline.prototype.hasNot = function() {
    return this.add('hasNot', 'Main', arguments);
  };

  Pipeline.prototype.interval = function() {
    return this.add('interval', 'Main', arguments);
  };

  Pipeline.prototype.or = function() {
    return this.add('or', 'Pipes', arguments);
  };

  Pipeline.prototype.random = function() {
    return this.add('random', 'Main', arguments);
  };

  Pipeline.prototype.retain = function() {
    return this.add('retain', 'Collection', arguments);
  };

  Pipeline.prototype.simplePath = function() {
    return this.add('simplePath', 'Main', arguments);
  };

  /*** Side Effect ***/
  Pipeline.prototype.aggregate = function() {
    throw new Error('Not implemented.');
  };

  Pipeline.prototype.as = function() {
    return this.add('as', 'Main', arguments);
  };

  Pipeline.prototype.groupBy = function() {
    return this.add('groupBy', 'Main', arguments);
  };

  // Not FullyImplemented ??
  Pipeline.prototype.groupCount = function() {
    return this.add('groupCount', 'Main', arguments);
  };

  Pipeline.prototype.optional = function() {
    return this.add('optional', 'Main', arguments);
  };

  Pipeline.prototype.sideEffect = function() {
    return this.add('sideEffect', 'Main', arguments);
  };

  Pipeline.prototype.linkBoth = function() {
    return this.add('linkBoth', 'Main', arguments);
  };

  Pipeline.prototype.linkIn = function() {
    return this.add('linkIn', 'Main', arguments);
  };

  Pipeline.prototype.linkOut = function() {
    return this.add('linkOut', 'Main', arguments);
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
    return this.add('copySplit', 'Pipes', arguments);
  };
  Pipeline.prototype.exhaustMerge = function() {
    return this.add('exhaustMerge', 'Main', arguments);
  };

  Pipeline.prototype.fairMerge = function() {
    return this.add('fairMerge', 'Main', arguments);
  };

  // g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
  Pipeline.prototype.ifThenElse = function() {
    return this.add('ifThenElse', 'Main', arguments);
  };

  Pipeline.prototype.loop = function() {
    return this.add('loop', 'Main', arguments);
  };

  /*** Methods ***/
  Pipeline.prototype.fill = function() {
    throw new Error('Not implemented');
  };

  Pipeline.prototype.count = function() {
    return this.add('count', 'Main', arguments);
  };

  Pipeline.prototype.iterate = function() {
    return this.add('iterate', 'Main', arguments);
  };

  Pipeline.prototype.next = function() {
    return this.add('next', 'Main', arguments);
  };

  Pipeline.prototype.toList = function() {
    return this.add('toList', 'Main', arguments);
  };

  Pipeline.prototype.keys = function() {
    return this.add('keys', 'Main', arguments);
  };

  Pipeline.prototype.remove = function() {
    return this.add('remove', 'Main', arguments);
  };

  Pipeline.prototype.values = function() {
    return this.add('values', 'Main', arguments);
  };

  Pipeline.prototype.put = function() {
    return this.add('put', 'Pipes', arguments);
  };

  Pipeline.prototype.getPropertyKeys = function() {
    return this.add('getPropertyKeys', 'Main', arguments);
  };

  Pipeline.prototype.setProperty = function() {
    return this.add('setProperty', 'Main', arguments);
  };

  Pipeline.prototype.getProperty = function() {
    return this.add('getProperty', 'Main', arguments);
  };

  // Titan specifics
  Pipeline.prototype.name = function() {
    return this.add('name', 'Main', arguments);
  };

  Pipeline.prototype.dataType = function() {
    return this.add('dataType', 'Main', arguments);
  };

  Pipeline.prototype.indexed = function() {
    return this.add('indexed', 'Main', arguments);
  };

  Pipeline.prototype.unique = function() {
    return this.add('unique', 'Main', arguments);
  };

  Pipeline.prototype.makePropertyKey = function() {
    return this.add('makePropertyKey', 'Main', arguments);
  };

  Pipeline.prototype.group = function() {
    return this.add('group', 'Main', arguments);
  };

  Pipeline.prototype.makeEdgeLabel = function() {
    return this.add('makeEdgeLabel', 'Main', arguments);
  };

  Pipeline.prototype.query = function() {
    return this.add('query', 'Main', arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.single = function() {
    return this.add('single', 'Main', arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.list = function() {
    return this.add('list', 'Main', arguments);
  };

  // Titan v0.4.0+: replaces unique(Direction.IN)
  Pipeline.prototype.oneToMany = function() {
    return this.add('oneToMany', 'Main', arguments);
  };

  // Titan v0.4.0+: replaces unique(Direction.OUT)
  Pipeline.prototype.manyToOne = function() {
    return this.add('manyToOne', 'Main', arguments);
  };

  // Titan v0.4.0+: replaces unique(Direction.IN) and unique(Direction.OUT)
  Pipeline.prototype.oneToOne = function() {
    return this.add('oneToOne', 'Main', arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeKey = function() {
    return this.add('makeKey', 'Main', arguments);
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeLabel = function() {
    return this.add('makeLabel', 'Main', arguments);
  };

  Pipeline.prototype.make = function() {
    return this.add('make', 'Main', arguments);
  };

  Pipeline.prototype.sortKey = function() {
    return this.add('sortKey', 'Main', arguments);
  };

  Pipeline.prototype.signature = function() {
    return this.add('signature', 'Main', arguments);
  };

  Pipeline.prototype.unidirected = function() {
    return this.add('unidirected', 'Main', arguments);
  };

  Pipeline.prototype.createKeyIndex = function() {
    return this.add('createKeyIndex', 'Main', arguments);
  };

  Pipeline.prototype.getIndexes = function() {
    return this.add('getIndexes', 'Main', arguments);
  };

  Pipeline.prototype.hasIndex = function() {
    return this.add('hasIndex', 'Main', arguments);
  };

  return Pipeline;

})();
