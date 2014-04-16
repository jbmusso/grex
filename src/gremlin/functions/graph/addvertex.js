var inherits = require('util').inherits;

var _ = require('lodash');

var Vertex = require('../../vertex');
var GremlinMethod = require('../function');

module.exports = (function() {
  function AddVertexMethod() {
    GremlinMethod.call(this, 'addVertex', arguments[0]);
  }

  inherits(AddVertexMethod, GremlinMethod);

  AddVertexMethod.prototype.run = function(gremlin, identifier) {
    this.vertex = new Vertex(gremlin);

    this.vertex.identifier = identifier; // Non-enumerable property

    _.each(this.args.rawArgs, function(value, key) {
      this.vertex[key] = value;
    }, this);

    return this.vertex;
  };

  AddVertexMethod.prototype.toGroovy = function() {
    var identifierPrefix = this.vertex.identifier ? this.vertex.identifier + ' = ' : '';

    var id = this.vertex._id ? this.vertex._id +',' : '';

    var str = identifierPrefix +'g.addVertex('+ id + this.args.stringifyArgument(this.args.rawArgs) +')';

    return str;
  };

  return AddVertexMethod;
})();