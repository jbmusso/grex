'use strict';
var inherits = require('util').inherits;

var GremlinObject = require('./object');
var GremlinStep = require('../functions/steps/step');
var CollectionAccessor = require('../functions/collectionaccessor');
var CollectionStep = require('../functions/steps/collectionstep');
var PipesStep = require('../functions/steps/pipesstep');
var SelectStep = require('../functions/steps/select');

module.exports = (function () {
  function Pipeline(object) {
    GremlinObject.call(this, object);
  }

  inherits(Pipeline, GremlinObject);

  /**
   * Send the underlying GremlinScript to the server for execution, returning
   * raw results.
   *
   * This method is a shorthand for GremlinScript.exec().
   *
   * Support the dual callback/promise API.
   *
   * @param {Function} callback
   */
  Pipeline.prototype.exec =
  Pipeline.prototype.execute = function(callback) {
    return this.gremlin.exec(callback);
  };

  /**
   * Send the underlying GremlinScript script to the server for execution, returning
   * instantiated results.
   *
   * This method is a shorthand for GremlinScript.fetch().
   *
   * Support the dual callback/promise API.
   *
   * @param {Function} callback
   */
  Pipeline.prototype.fetch = function(callback) {
    return this.gremlin.fetch(callback);
  };


  Pipeline.prototype.both = function() {
    var step = new GremlinStep('both', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.bothE = function() {
    var step = new GremlinStep('bothE', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.bothV = function() {
    var step = new GremlinStep('bothV', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.cap = function() {
    var step = new GremlinStep('cap', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.gather = function() {
    var step = new GremlinStep('gather', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.id = function() {
    var step = new GremlinStep('id', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.in = function() {
    var step = new GremlinStep('in', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.inE = function() {
    var step = new GremlinStep('inE', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.inV = function() {
    var step = new GremlinStep('inV', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.property = function() {
    var step = new GremlinStep('property', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.label = function() {
    var step = new GremlinStep('label', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.map = function() {
    var step = new GremlinStep('map', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.memoize = function() {
    var step = new GremlinStep('memoize', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.order = function() {
    var step = new GremlinStep('order', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.out = function() {
    var step = new GremlinStep('out', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.outE = function() {
    var step = new GremlinStep('outE', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.outV = function() {
    var step = new GremlinStep('outV', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.path = function() {
    var step = new GremlinStep('path', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.scatter = function() {
    var step = new GremlinStep('scatter', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.select = function() {
    var step = new SelectStep(arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.transform = function() {
    var step = new GremlinStep('transform', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.orderMap = function() {
    var step = new GremlinStep('orderMap', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  /*** Filter ***/
  // index(i)
  Pipeline.prototype.index = function() {
    var step = new CollectionAccessor(arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // range('[i..j]')
  Pipeline.prototype.range = function() {
    var step = new CollectionAccessor(arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.and = function() {
    var step = new PipesStep('and', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.back = function() {
    var step = new GremlinStep('back', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.dedup = function() {
    var step = new GremlinStep('dedup', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.except = function() {
    var step = new CollectionStep('except', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.filter = function() {
    var step = new GremlinStep('filter', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.has = function() {
    var step = new GremlinStep('has', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.hasNot = function() {
    var step = new GremlinStep('hasNot', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.interval = function() {
    var step = new GremlinStep('interval', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.or = function() {
    var step = new PipesStep('or', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.random = function() {
    var step = new GremlinStep('random', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.retain = function() {
    var step = new CollectionStep('retain', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.simplePath = function() {
    var step = new GremlinStep('simplePath', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  /*** Side Effect ***/
  Pipeline.prototype.aggregate = function() {
    throw new Error('Not implemented.');
  };

  Pipeline.prototype.as = function() {
    var step = new GremlinStep('as', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.groupBy = function() {
    var step = new GremlinStep('groupBy', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Not FullyImplemented ??
  Pipeline.prototype.groupCount = function() {
    var step = new GremlinStep('groupCount', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.optional = function() {
    var step = new GremlinStep('optional', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.sideEffect = function() {
    var step = new GremlinStep('sideEffect', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.linkBoth = function() {
    var step = new GremlinStep('linkBoth', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.linkIn = function() {
    var step = new GremlinStep('linkIn', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.linkOut = function() {
    var step = new GremlinStep('linkOut', arguments);
    this.methods.push(step.toGroovy());

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
    var step = new PipesStep('copySplit', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };
  Pipeline.prototype.exhaustMerge = function() {
    var step = new GremlinStep('exhaustMerge', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.fairMerge = function() {
    var step = new GremlinStep('fairMerge', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
  Pipeline.prototype.ifThenElse = function() {
    var step = new GremlinStep('ifThenElse', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.loop = function() {
    var step = new GremlinStep('loop', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  /*** Methods ***/
  Pipeline.prototype.fill = function() {
    throw new Error('Not implemented');
  };

  Pipeline.prototype.count = function() {
    var step = new GremlinStep('count', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.iterate = function() {
    var step = new GremlinStep('iterate', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.next = function() {
    var step = new GremlinStep('next', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.toList = function() {
    var step = new GremlinStep('toList', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.keys = function() {
    var step = new GremlinStep('keys', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.remove = function() {
    var step = new GremlinStep('remove', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.values = function() {
    var step = new GremlinStep('values', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.put = function() {
    var step = new PipesStep('put', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.getPropertyKeys = function() {
    var step = new GremlinStep('getPropertyKeys', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.setProperty = function() {
    var step = new GremlinStep('setProperty', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.getProperty = function() {
    var step = new GremlinStep('getProperty', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan specifics
  Pipeline.prototype.name = function() {
    var step = new GremlinStep('name', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.dataType = function() {
    var step = new GremlinStep('dataType', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.indexed = function() {
    var step = new GremlinStep('indexed', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.unique = function() {
    var step = new GremlinStep('unique', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.makePropertyKey = function() {
    var step = new GremlinStep('makePropertyKey', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.group = function() {
    var step = new GremlinStep('group', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.makeEdgeLabel = function() {
    var step = new GremlinStep('makeEdgeLabel', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.query = function() {
    var step = new GremlinStep('query', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.single = function() {
    var step = new GremlinStep('single', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.list = function() {
    var step = new GremlinStep('list', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.IN)
  Pipeline.prototype.oneToMany = function() {
    var step = new GremlinStep('oneToMany', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.OUT)
  Pipeline.prototype.manyToOne = function() {
    var step = new GremlinStep('manyToOne', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.IN) and unique(Direction.OUT)
  Pipeline.prototype.oneToOne = function() {
    var step = new GremlinStep('oneToOne', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeKey = function() {
    var step = new GremlinStep('makeKey', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  Pipeline.prototype.makeLabel = function() {
    var step = new GremlinStep('makeLabel', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.make = function() {
    var step = new GremlinStep('make', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.sortKey = function() {
    var step = new GremlinStep('sortKey', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.signature = function() {
    var step = new GremlinStep('signature', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.unidirected = function() {
    var step = new GremlinStep('unidirected', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.createKeyIndex = function() {
    var step = new GremlinStep('createKeyIndex', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.getIndexes = function() {
    var step = new GremlinStep('getIndexes', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.hasIndex = function() {
    var step = new GremlinStep('hasIndex', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  Pipeline.prototype.key = function() {
    this.methods.push('.'+ arguments[0]);

    return this;
  };

  return Pipeline;

})();
