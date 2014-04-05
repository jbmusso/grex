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
  Pipeline.prototype.exec =
  Pipeline.prototype.execute = function(callback) {
    return this.gremlin.exec(callback);
  };

  Pipeline.prototype.fetch = function(callback) {
    return this.gremlin.fetch(callback);
  };

  Pipeline.prototype.both = function() {
    this.gremlin.appendMain('both', arguments);
    return this;
  };

  Pipeline.prototype.bothE = function() {
    this.gremlin.appendMain('bothE', arguments);
    return this;
  };

  Pipeline.prototype.bothV = function() {
    this.gremlin.appendMain('bothV', arguments);
    return this;
  };

  Pipeline.prototype.cap = function() {
    this.gremlin.appendMain('cap', arguments);
    return this;
  };

  Pipeline.prototype.gather = function() {
    this.gremlin.appendMain('gather', arguments);
    return this;
  };

  Pipeline.prototype.id = function() {
    this.gremlin.appendMain('id', arguments);
    return this;
  };

  Pipeline.prototype.in = function() {
    this.gremlin.appendMain('in', arguments);
    return this;
  };

  Pipeline.prototype.inE = function() {
    this.gremlin.appendMain('inE', arguments);
    return this;
  };

  Pipeline.prototype.inV = function() {
    this.gremlin.appendMain('inV', arguments);
    return this;
  };

  Pipeline.prototype.property = function() {
    this.gremlin.appendMain('property', arguments);
    return this;
  };

  Pipeline.prototype.label = function() {
    this.gremlin.appendMain('label', arguments);
    return this;
  };

  Pipeline.prototype.map = function() {
    this.gremlin.appendMain('map', arguments);
    return this;
  };

  Pipeline.prototype.memoize = function() {
    this.gremlin.appendMain('memoize', arguments);
    return this;
  };

  Pipeline.prototype.order = function() {
    this.gremlin.appendMain('order', arguments);
    return this;
  };

  Pipeline.prototype.out = function() {
    this.gremlin.appendMain('out', arguments);
    return this;
  };

  Pipeline.prototype.outE = function() {
    this.gremlin.appendMain('outE', arguments);
    return this;
  };

  Pipeline.prototype.outV = function() {
    this.gremlin.appendMain('outV', arguments);
    return this;
  };

  Pipeline.prototype.path = function() {
    this.gremlin.appendMain('path', arguments);
    return this;
  };

  Pipeline.prototype.scatter = function() {
    this.gremlin.appendMain('scatter', arguments);
    return this;
  };

  Pipeline.prototype.select = function() {
    this.gremlin.append('.select' + this.gremlin.argumentHandler.buildString(arguments, true));
    return this;
  };

  Pipeline.prototype.transform = function() {
    this.gremlin.appendMain('transform', arguments);
    return this;
  };

  Pipeline.prototype.orderMap = function() {
    this.gremlin.appendMain('orderMap', arguments);
    return this;
  };

  /*** Filter ***/
  // index(i)
  Pipeline.prototype.index = function() {
    this.gremlin.appendIndex(arguments);
    return this;
  };

  // range('[i..j]')
  Pipeline.prototype.range = function() {
    this.gremlin.appendIndex(arguments);
    return this;
  };

  Pipeline.prototype.and = function() {
    this.gremlin.appendPipes('and', arguments);
    return this;
  };

  Pipeline.prototype.back = function() {
    this.gremlin.appendMain('back', arguments);
    return this;
  };

  Pipeline.prototype.dedup = function() {
    this.gremlin.appendMain('dedup', arguments);
    return this;
  };

  Pipeline.prototype.except = function() {
    this.gremlin.appendCollection('except', arguments);
    return this;
  };

  Pipeline.prototype.filter = function() {
    this.gremlin.appendMain('filter', arguments);
    return this;
  };

  Pipeline.prototype.has = function() {
    this.gremlin.appendMain('has', arguments);
    return this;
  };

  Pipeline.prototype.hasNot = function() {
    this.gremlin.appendMain('hasNot', arguments);
    return this;
  };

  Pipeline.prototype.interval = function() {
    this.gremlin.appendMain('interval', arguments);
    return this;
  };

  Pipeline.prototype.or = function() {
    this.gremlin.appendPipes('or', arguments);
    return this;
  };

  Pipeline.prototype.random = function() {
    this.gremlin.appendMain('random', arguments);
    return this;
  };

  Pipeline.prototype.retain = function() {
    this.gremlin.appendCollection('retain', arguments);
    return this;
  };

  Pipeline.prototype.simplePath = function() {
    this.gremlin.appendMain('simplePath', arguments);
    return this;
  };

  /*** Side Effect ***/
  Pipeline.prototype.aggregate = function() {
    throw new Error('Not implemented.');
  };

  Pipeline.prototype.as = function() {
    this.gremlin.appendMain('as', arguments);
    return this;
  };

  Pipeline.prototype.groupBy = function() {
    this.gremlin.appendMain('groupBy', arguments);
    return this;
  };

  // Not FullyImplemented ??
  Pipeline.prototype.groupCount = function() {
    this.gremlin.appendMain('groupCount', arguments);
    return this;
  };

  Pipeline.prototype.optional = function() {
    this.gremlin.appendMain('optional', arguments);
    return this;
  };

  Pipeline.prototype.sideEffect = function() {
    this.gremlin.appendMain('sideEffect', arguments);
    return this;
  };

  Pipeline.prototype.linkBoth = function() {
    this.gremlin.appendMain('linkBoth', arguments);
    return this;
  };

  Pipeline.prototype.linkIn = function() {
    this.gremlin.appendMain('linkIn', arguments);
    return this;
  };

  Pipeline.prototype.linkOut = function() {
    this.gremlin.appendMain('linkOut', arguments);
    return this;
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
    this.gremlin.appendPipes('copySplit', arguments);
    return this;
  };
  Pipeline.prototype.exhaustMerge = function() {
    this.gremlin.appendMain('exhaustMerge', arguments);
    return this;
  };

  Pipeline.prototype.fairMerge = function() {
    this.gremlin.appendMain('fairMerge', arguments);
    return this;
  };

  // g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
  Pipeline.prototype.ifThenElse = function() {
    this.gremlin.appendMain('ifThenElse', arguments);
    return this;
  };

  Pipeline.prototype.loop = function() {
    this.gremlin.appendMain('loop', arguments);
    return this;
  };

  /*** Methods ***/
  Pipeline.prototype.fill = function() {
    throw new Error('Not implemented');
  };

  Pipeline.prototype.count = function() {
    this.gremlin.appendMain('count', arguments);
    return this;
  };

  Pipeline.prototype.iterate = function() {
    this.gremlin.appendMain('iterate', arguments);
    return this;
  };

  Pipeline.prototype.next = function() {
    this.gremlin.appendMain('next', arguments);
    return this;
  };

  Pipeline.prototype.toList = function() {
    this.gremlin.appendMain('toList', arguments);
    return this;
  };

  Pipeline.prototype.keys = function() {
    this.gremlin.appendMain('keys', arguments);
    return this;
  };

  Pipeline.prototype.remove = function() {
    this.gremlin.appendMain('remove', arguments);
    return this;
  };

  Pipeline.prototype.values = function() {
    this.gremlin.appendMain('values', arguments);
    return this;
  };

  Pipeline.prototype.put = function() {
    this.gremlin.appendPipes('put', arguments);
    return this;
  };

  Pipeline.prototype.getPropertyKeys = function() {
    this.gremlin.appendMain('getPropertyKeys', arguments);
    return this;
  };

  Pipeline.prototype.setProperty = function() {
    this.gremlin.appendMain('setProperty', arguments);
    return this;
  };

  Pipeline.prototype.getProperty = function() {
    this.gremlin.appendMain('getProperty', arguments);
    return this;
  };

  // Titan specifics
  Pipeline.prototype.name = function() {
    this.gremlin.appendMain('name', arguments);
    return this;
  };

  Pipeline.prototype.dataType = function() {
    this.gremlin.appendMain('dataType', arguments);
    return this;
  };

  Pipeline.prototype.indexed = function() {
    this.gremlin.appendMain('indexed', arguments);
    return this;
  };

  Pipeline.prototype.unique = function() {
    this.gremlin.appendMain('unique', arguments);
    return this;
  };

  Pipeline.prototype.makePropertyKey = function() {
    this.gremlin.appendMain('makePropertyKey', arguments);
    return this;
  };

  Pipeline.prototype.group = function() {
    this.gremlin.appendMain('group', arguments);
    return this;
  };

  Pipeline.prototype.makeEdgeLabel = function() {
    this.gremlin.appendMain('makeEdgeLabel', arguments);
    return this;
  };

  Pipeline.prototype.query = function() {
    this.gremlin.appendMain('query', arguments);
    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.single = function() {
    this.gremlin.appendMain('single', arguments);
    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.list = function() {
    this.gremlin.appendMain('list', arguments);
    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.IN)
  Pipeline.prototype.oneToMany = function() {
    this.gremlin.appendMain('oneToMany', arguments);
    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.OUT)
  Pipeline.prototype.manyToOne = function() {
    this.gremlin.appendMain('manyToOne', arguments);
    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.IN) and unique(Direction.OUT)
  Pipeline.prototype.oneToOne = function() {
    this.gremlin.appendMain('oneToOne', arguments);
    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeKey = function() {
    this.gremlin.appendMain('makeKey', arguments);
    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeLabel = function() {
    this.gremlin.appendMain('makeLabel', arguments);
    return this;
  };

  Pipeline.prototype.make = function() {
    this.gremlin.appendMain('make', arguments);
    return this;
  };

  Pipeline.prototype.sortKey = function() {
    this.gremlin.appendMain('sortKey', arguments);
    return this;
  };

  Pipeline.prototype.signature = function() {
    this.gremlin.appendMain('signature', arguments);
    return this;
  };

  Pipeline.prototype.unidirected = function() {
    this.gremlin.appendMain('unidirected', arguments);
    return this;
  };

  Pipeline.prototype.createKeyIndex = function() {
    this.gremlin.appendMain('createKeyIndex', arguments);
    return this;
  };

  Pipeline.prototype.getIndexes = function() {
    this.gremlin.appendMain('getIndexes', arguments);
    return this;
  };

  Pipeline.prototype.hasIndex = function() {
    this.gremlin.appendMain('hasIndex', arguments);
    return this;
  };

  Pipeline.prototype.key = function() {
    this.gremlin.append('.' + arguments[0]);
    return this;
  };

  return Pipeline;

})();
