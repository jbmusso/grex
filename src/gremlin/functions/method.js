var inherits = require('util').inherits;

var GremlinFunction = require('./function');

module.exports = (function() {
  function GremlinMethod() {
    GremlinFunction.apply(this, arguments);
  }

  GremlinMethod.prototype.toGroovy = function() {
    return '.' + this.name + this.args.toGroovy();
  };

  return GremlinMethod;
})();