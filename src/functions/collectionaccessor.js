var inherits = require('util').inherits;

var GremlinFunction = require('./function');

module.exports = (function() {
  function CollectionAccessor() {
    GremlinFunction.call(this, null, arguments[0]);
  }

  inherits(CollectionAccessor, GremlinFunction);

  CollectionAccessor.prototype.toString = function() {
    var str = '['+ this.args.rawArgs[0].toString() + ']';

    return str;
  };

  return CollectionAccessor;
})();