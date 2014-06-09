/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var ObjectWrapper = require('./objectwrapper');
var GremlinStep = require('../functions/steps/step');
var CollectionAccessor = require('../functions/collectionaccessor');
var CollectionStep = require('../functions/steps/collectionstep');
var PipesStep = require('../functions/steps/pipesstep');
var SelectStep = require('../functions/steps/select');

module.exports = (function () {
  function PipelineWrapper(object) {
    ObjectWrapper.call(this, object);
  }

  inherits(PipelineWrapper, ObjectWrapper);

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
  PipelineWrapper.prototype.exec =
  PipelineWrapper.prototype.execute = function(callback) {
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
  PipelineWrapper.prototype.fetch = function(callback) {
    return this.gremlin.fetch(callback);
  };


  PipelineWrapper.prototype.both = function() {
    var step = new GremlinStep('both', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.bothE = function() {
    var step = new GremlinStep('bothE', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.bothV = function() {
    var step = new GremlinStep('bothV', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.cap = function() {
    var step = new GremlinStep('cap', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.gather = function() {
    var step = new GremlinStep('gather', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.id = function() {
    var step = new GremlinStep('id', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.in = function() {
    var step = new GremlinStep('in', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.inE = function() {
    var step = new GremlinStep('inE', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.inV = function() {
    var step = new GremlinStep('inV', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.property = function() {
    var step = new GremlinStep('property', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.label = function() {
    var step = new GremlinStep('label', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.map = function() {
    var step = new GremlinStep('map', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.memoize = function() {
    var step = new GremlinStep('memoize', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.order = function() {
    var step = new GremlinStep('order', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.out = function() {
    var step = new GremlinStep('out', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.outE = function() {
    var step = new GremlinStep('outE', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.outV = function() {
    var step = new GremlinStep('outV', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.path = function() {
    var step = new GremlinStep('path', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.scatter = function() {
    var step = new GremlinStep('scatter', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.select = function() {
    var step = new SelectStep(arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.transform = function() {
    var step = new GremlinStep('transform', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.orderMap = function() {
    var step = new GremlinStep('orderMap', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  /*** Filter ***/
  // index(i)
  PipelineWrapper.prototype.index = function() {
    var step = new CollectionAccessor(arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // range('[i..j]')
  PipelineWrapper.prototype.range = function() {
    var step = new CollectionAccessor(arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.and = function() {
    var step = new PipesStep('and', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.back = function() {
    var step = new GremlinStep('back', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.dedup = function() {
    var step = new GremlinStep('dedup', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.except = function() {
    var step = new CollectionStep('except', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.filter = function() {
    var step = new GremlinStep('filter', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.has = function() {
    var step = new GremlinStep('has', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.hasNot = function() {
    var step = new GremlinStep('hasNot', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.interval = function() {
    var step = new GremlinStep('interval', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.or = function() {
    var step = new PipesStep('or', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.random = function() {
    var step = new GremlinStep('random', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.retain = function() {
    var step = new CollectionStep('retain', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.simplePath = function() {
    var step = new GremlinStep('simplePath', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  /*** Side Effect ***/
  PipelineWrapper.prototype.aggregate = function() {
    throw new Error('Not implemented.');
  };

  PipelineWrapper.prototype.as = function() {
    var step = new GremlinStep('as', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.groupBy = function() {
    var step = new GremlinStep('groupBy', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Not FullyImplemented ??
  PipelineWrapper.prototype.groupCount = function() {
    var step = new GremlinStep('groupCount', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.optional = function() {
    var step = new GremlinStep('optional', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.sideEffect = function() {
    var step = new GremlinStep('sideEffect', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.linkBoth = function() {
    var step = new GremlinStep('linkBoth', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.linkIn = function() {
    var step = new GremlinStep('linkIn', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.linkOut = function() {
    var step = new GremlinStep('linkOut', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.store = function() {
    throw new Error('Not implemented');
  };

  PipelineWrapper.prototype.table = function() {
    throw new Error('Not implemented');
  };

  PipelineWrapper.prototype.tree = function() {
    throw new Error('Not implemented');
  };

  /*** Branch ***/
  PipelineWrapper.prototype.copySplit = function() {
    var step = new PipesStep('copySplit', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };
  PipelineWrapper.prototype.exhaustMerge = function() {
    var step = new GremlinStep('exhaustMerge', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.fairMerge = function() {
    var step = new GremlinStep('fairMerge', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // g.v(1).out().ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
  PipelineWrapper.prototype.ifThenElse = function() {
    var step = new GremlinStep('ifThenElse', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.loop = function() {
    var step = new GremlinStep('loop', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  /*** Methods ***/
  PipelineWrapper.prototype.fill = function() {
    throw new Error('Not implemented');
  };

  PipelineWrapper.prototype.count = function() {
    var step = new GremlinStep('count', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.iterate = function() {
    var step = new GremlinStep('iterate', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.next = function() {
    var step = new GremlinStep('next', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.toList = function() {
    var step = new GremlinStep('toList', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.keys = function() {
    var step = new GremlinStep('keys', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.remove = function() {
    var step = new GremlinStep('remove', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.values = function() {
    var step = new GremlinStep('values', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.put = function() {
    var step = new PipesStep('put', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.getPropertyKeys = function() {
    var step = new GremlinStep('getPropertyKeys', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.setProperty = function() {
    var step = new GremlinStep('setProperty', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.getProperty = function() {
    var step = new GremlinStep('getProperty', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan specifics
  PipelineWrapper.prototype.name = function() {
    var step = new GremlinStep('name', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.dataType = function() {
    var step = new GremlinStep('dataType', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.indexed = function() {
    var step = new GremlinStep('indexed', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.unique = function() {
    var step = new GremlinStep('unique', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.makePropertyKey = function() {
    var step = new GremlinStep('makePropertyKey', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.group = function() {
    var step = new GremlinStep('group', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.makeEdgeLabel = function() {
    var step = new GremlinStep('makeEdgeLabel', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.query = function() {
    var step = new GremlinStep('query', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  PipelineWrapper.prototype.single = function() {
    var step = new GremlinStep('single', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  PipelineWrapper.prototype.list = function() {
    var step = new GremlinStep('list', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.IN)
  PipelineWrapper.prototype.oneToMany = function() {
    var step = new GremlinStep('oneToMany', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.OUT)
  PipelineWrapper.prototype.manyToOne = function() {
    var step = new GremlinStep('manyToOne', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+: replaces unique(Direction.IN) and unique(Direction.OUT)
  PipelineWrapper.prototype.oneToOne = function() {
    var step = new GremlinStep('oneToOne', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  PipelineWrapper.prototype.makeKey = function() {
    var step = new GremlinStep('makeKey', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  // Titan v0.4.0+
  PipelineWrapper.prototype.makeLabel = function() {
    var step = new GremlinStep('makeLabel', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.make = function() {
    var step = new GremlinStep('make', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.sortKey = function() {
    var step = new GremlinStep('sortKey', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.signature = function() {
    var step = new GremlinStep('signature', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.unidirected = function() {
    var step = new GremlinStep('unidirected', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.createKeyIndex = function() {
    var step = new GremlinStep('createKeyIndex', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.getIndexes = function() {
    var step = new GremlinStep('getIndexes', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.hasIndex = function() {
    var step = new GremlinStep('hasIndex', arguments);
    this.methods.push(step.toGroovy());

    return this;
  };

  PipelineWrapper.prototype.key = function() {
    this.methods.push('.'+ arguments[0]);

    return this;
  };

  return PipelineWrapper;

})();
